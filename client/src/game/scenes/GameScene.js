import Phaser from 'phaser';
import { gameStore } from '@/state/gameStore';
import { gameRuntime } from '@/game/bridge/GameRuntime';
import { createParallaxBackground } from '@/game/world/createParallaxBackground';
import { createForestWorld } from '@/game/world/createForestWorld';
import { Player } from '@/game/entities/Player';
import { Slime } from '@/game/entities/Slime';
import { ForestGuide } from '@/game/entities/ForestGuide';
import { CombatSystem } from '@/game/combat/CombatSystem';
import { CurrencySystem } from '@/game/systems/CurrencySystem';
import { ExperienceSystem } from '@/game/systems/ExperienceSystem';
import { QuestSystem } from '@/game/systems/QuestSystem';
import { createDefaultPlayerCharacter } from '@/game/character/catalog';
import { PLAYER_CONFIG, QUEST_REWARD, REACT_HUD_UPDATE_DISTANCE } from '@/game/config/constants';
export class GameScene extends Phaser.Scene {
    player;
    slimes = [];
    guide;
    platforms;
    keys;
    combatSystem;
    experienceSystem;
    currencySystem;
    questSystem;
    parallax;
    worldBounds = { width: 0, height: 0 };
    respawnPoint = new Phaser.Math.Vector2(0, 0);
    guidePrompt;
    attackCooldownHintUntil = 0;
    savedSnapshot;
    runtimeBridge = {
        respawnPlayer: () => this.respawnPlayer(),
        claimQuestReward: () => this.claimQuestReward()
    };
    constructor() {
        super('GameScene');
    }
    create() {
        this.savedSnapshot = {
            player: gameStore.getState().player,
            quest: gameStore.getState().quest
        };
        gameStore.resetUi();
        gameRuntime.register(this.runtimeBridge);
        this.worldBounds = { width: 4200, height: 960 };
        this.physics.world.setBounds(0, 0, this.worldBounds.width, this.worldBounds.height);
        this.cameras.main.setBounds(0, 0, this.worldBounds.width, this.worldBounds.height);
        this.cameras.main.setZoom(1);
        this.parallax = createParallaxBackground(this);
        const forestWorld = createForestWorld(this);
        this.platforms = forestWorld.platforms;
        this.respawnPoint = forestWorld.respawnPoint;
        this.combatSystem = new CombatSystem(this);
        this.experienceSystem = new ExperienceSystem((nextState) => {
            gameStore.patchPlayer(nextState);
            gameStore.setLevelUpMessage(`Level ${nextState.level} reached`);
            gameStore.setNotification({ message: `Level up! You are now level ${nextState.level}.`, kind: 'success' });
            this.time.delayedCall(1800, () => gameStore.setLevelUpMessage(null));
            this.time.delayedCall(2200, () => gameStore.setNotification(null));
        });
        this.currencySystem = new CurrencySystem((gold) => {
            gameStore.patchPlayer({ gold });
        });
        this.questSystem = new QuestSystem((quest) => {
            gameStore.patchQuest(quest);
            if (quest.completed && !quest.rewardClaimed) {
                gameStore.setNotification({ message: 'Quest complete: return to the Forest Guide.', kind: 'success' });
            }
        });
        this.player = new Player(this, this.respawnPoint.x, this.respawnPoint.y, {
            movementSpeed: PLAYER_CONFIG.movementSpeed,
            jumpForce: PLAYER_CONFIG.jumpForce,
            gravity: PLAYER_CONFIG.gravity,
            attackCooldown: PLAYER_CONFIG.attackCooldown,
            character: createDefaultPlayerCharacter()
        });
        const playerBody = this.player.body;
        playerBody.setMaxVelocity(360, 900);
        playerBody.setCollideWorldBounds(true);
        this.player.on('death', () => {
            gameStore.setDeathOpen(true);
            gameStore.setNotification({ message: 'You were defeated. Respawn to continue.', kind: 'danger' });
        });
        this.guide = new ForestGuide(this, forestWorld.guideSpot.x, forestWorld.guideSpot.y);
        this.guide.setScrollFactor(1);
        this.guidePrompt = this.add.text(this.guide.x, this.guide.y - 72, 'Press E', {
            fontFamily: 'Inter, sans-serif',
            fontSize: '18px',
            color: '#fff7d5',
            backgroundColor: 'rgba(6, 12, 24, 0.72)',
            padding: { left: 10, right: 10, top: 6, bottom: 6 }
        }).setOrigin(0.5).setDepth(30).setVisible(false);
        this.slimes = forestWorld.slimeSpawns.map((spawn) => new Slime(this, spawn.x, spawn.y, {
            onDefeated: (slime) => this.handleSlimeDefeated(slime)
        }));
        this.addPhysicsInteractions();
        this.setupInput();
        this.configureCamera();
        this.setupEvents();
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            gameRuntime.unregister(this.runtimeBridge);
        });
        this.syncPlayerToStore();
        gameStore.setPrompt(null);
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    }
    update(_time, _delta) {
        this.parallax.update(this.cameras.main.scrollX);
        this.updatePromptPosition();
        if (this.player.isDead) {
            this.player.setVelocityX(0);
            this.player.setVelocityY(0);
            gameStore.setPrompt(null);
            return;
        }
        const controls = this.getControls();
        this.player.updateControls(controls, this.time.now);
        if (controls.interact && this.isNearGuide()) {
            gameStore.setDialogueOpen(true);
            gameStore.setQuestOpen(true);
            gameStore.setPrompt(null);
        }
        const guideNearby = this.isNearGuide();
        gameStore.setPrompt(guideNearby && !gameStore.getState().ui.dialogueOpen ? 'Press E' : null);
        this.guidePrompt.setVisible(guideNearby && !gameStore.getState().ui.dialogueOpen);
        if (controls.attackPressed && this.time.now >= this.attackCooldownHintUntil) {
            const attacked = this.combatSystem.performPlayerAttack(this.player, this.slimes.filter((slime) => !slime.isDead));
            if (attacked) {
                this.attackCooldownHintUntil = this.time.now + PLAYER_CONFIG.attackCooldown;
                this.spawnFlash(this.player.x + (this.player.facing === 'right' ? 32 : -32), this.player.y - 12, 0xfff2aa);
            }
        }
        for (const slime of this.slimes) {
            slime.update(this.time.now, this.player);
        }
        if (this.player.state !== 'dead') {
            gameStore.patchPlayer({
                hp: this.player.health.currentHP,
                maxHp: this.player.health.maxHP
            });
        }
        this.clampPlayerState();
    }
    respawnPlayer() {
        const currentMaxHp = gameStore.getState().player.maxHp;
        this.player.respawn(this.respawnPoint.x, this.respawnPoint.y, currentMaxHp);
        gameStore.patchPlayer({
            hp: currentMaxHp,
            maxHp: currentMaxHp
        });
        gameStore.setDeathOpen(false);
        gameStore.setNotification({ message: 'You respawned at the forest entrance.', kind: 'info' });
        this.time.delayedCall(1200, () => gameStore.setNotification(null));
    }
    claimQuestReward() {
        const questState = gameStore.getState().quest;
        const result = this.questSystem.claimReward(questState);
        if (!result) {
            return;
        }
        const reward = result.reward ?? QUEST_REWARD;
        const afterXp = this.experienceSystem.addExperience(gameStore.getState().player, reward.xp);
        gameStore.patchPlayer(afterXp.state);
        gameStore.patchPlayer({
            gold: this.currencySystem.addGold(afterXp.state.gold, reward.gold)
        });
        gameStore.setNotification({ message: 'Quest reward claimed.', kind: 'success' });
        gameStore.setDialogueOpen(false);
        gameStore.setQuestOpen(false);
        this.time.delayedCall(1800, () => gameStore.setNotification(null));
    }
    handleSlimeDefeated(slime) {
        const currentPlayer = gameStore.getState().player;
        const afterXp = this.experienceSystem.addExperience(currentPlayer, slime.xpReward);
        gameStore.patchPlayer(afterXp.state);
        gameStore.patchPlayer({
            gold: this.currencySystem.addGold(afterXp.state.gold, slime.goldReward)
        });
        const nextQuest = this.questSystem.recordSlimeDefeat(gameStore.getState().quest);
        gameStore.patchQuest(nextQuest);
        this.spawnFloatingText(slime.x, slime.y - 36, `+${slime.xpReward} XP`, '#8ddfff');
        this.spawnFloatingText(slime.x + 20, slime.y - 18, `+${slime.goldReward} Gold`, '#f1c15b');
        this.spawnHitParticles(slime.x, slime.y - 8, 0x8ff4bb);
        if (nextQuest.completed && !nextQuest.rewardClaimed) {
            gameStore.setDialogueOpen(true);
            gameStore.setQuestOpen(true);
        }
    }
    addPhysicsInteractions() {
        this.physics.add.collider(this.player, this.platforms);
        for (const slime of this.slimes) {
            this.physics.add.collider(slime, this.platforms);
            this.physics.add.collider(this.player, slime, undefined, undefined, this);
        }
    }
    setupInput() {
        const keys = this.input.keyboard?.addKeys({
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            jump: Phaser.Input.Keyboard.KeyCodes.SPACE,
            attack: Phaser.Input.Keyboard.KeyCodes.X,
            interact: Phaser.Input.Keyboard.KeyCodes.E,
            cursorLeft: Phaser.Input.Keyboard.KeyCodes.LEFT,
            cursorRight: Phaser.Input.Keyboard.KeyCodes.RIGHT,
            cursorUp: Phaser.Input.Keyboard.KeyCodes.UP
        });
        if (!keys) {
            throw new Error('Keyboard input is unavailable');
        }
        this.keys = keys;
    }
    configureCamera() {
        this.cameras.main.setDeadzone(220, 120);
        this.cameras.main.setLerp(0.08, 0.08);
    }
    setupEvents() {
        this.events.on('combat:impact', (x, y) => {
            this.spawnHitParticles(x, y, 0xfff0a8);
        });
    }
    getControls() {
        return {
            left: Phaser.Input.Keyboard.JustDown(this.keys.cursorLeft) || this.keys.left.isDown,
            right: Phaser.Input.Keyboard.JustDown(this.keys.cursorRight) || this.keys.right.isDown,
            jumpPressed: Phaser.Input.Keyboard.JustDown(this.keys.jump) || Phaser.Input.Keyboard.JustDown(this.keys.cursorUp),
            attackPressed: Phaser.Input.Keyboard.JustDown(this.keys.attack),
            interact: Phaser.Input.Keyboard.JustDown(this.keys.interact)
        };
    }
    isNearGuide() {
        return Phaser.Math.Distance.Between(this.player.x, this.player.y, this.guide.x, this.guide.y) <= REACT_HUD_UPDATE_DISTANCE;
    }
    updatePromptPosition() {
        this.guidePrompt.setPosition(this.guide.x, this.guide.y - 72);
    }
    clampPlayerState() {
        if (this.player.x < 0) {
            this.player.x = 0;
        }
        if (this.player.x > this.worldBounds.width) {
            this.player.x = this.worldBounds.width;
        }
        if (this.player.y > this.worldBounds.height + 120) {
            this.player.takeDamage(this.player.health.currentHP);
            gameStore.setDeathOpen(true);
        }
    }
    syncPlayerToStore() {
        gameStore.patchPlayer({
            hp: this.player.health.currentHP,
            maxHp: this.player.health.maxHP,
            level: gameStore.getState().player.level,
            xp: gameStore.getState().player.xp,
            maxXp: gameStore.getState().player.maxXp,
            gold: gameStore.getState().player.gold
        });
    }
    spawnFloatingText(x, y, text, color) {
        const floating = this.add.text(x, y, text, {
            fontFamily: 'Inter, sans-serif',
            fontSize: '18px',
            fontStyle: '700',
            color,
            stroke: '#08111f',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(40);
        this.tweens.add({
            targets: floating,
            y: y - 42,
            alpha: 0,
            duration: 850,
            ease: 'Sine.easeOut',
            onComplete: () => floating.destroy()
        });
    }
    spawnFlash(x, y, tint) {
        const flash = this.add.circle(x, y, 10, tint, 0.8).setDepth(35);
        this.tweens.add({
            targets: flash,
            scale: 2.8,
            alpha: 0,
            duration: 220,
            onComplete: () => flash.destroy()
        });
    }
    spawnHitParticles(x, y, tint) {
        for (let index = 0; index < 5; index += 1) {
            const particle = this.add.image(x, y, 'particle').setTint(tint).setScale(0.9 + index * 0.08).setDepth(38);
            const direction = Phaser.Math.Between(-1, 1) || 1;
            this.tweens.add({
                targets: particle,
                x: x + direction * Phaser.Math.Between(14, 24),
                y: y - Phaser.Math.Between(14, 28),
                alpha: 0,
                duration: 420,
                ease: 'Sine.easeOut',
                onComplete: () => particle.destroy()
            });
        }
    }
}
