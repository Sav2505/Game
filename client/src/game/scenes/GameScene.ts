import Phaser from 'phaser';
import type { SavedGameSnapshot } from '@shared/types';
import { gameStore } from '@/state/gameStore';
import { gameRuntime } from '@/game/bridge/GameRuntime';
import { createParallaxBackground } from '@/game/world/createParallaxBackground';
import { createForestWorld } from '@/game/world/createForestWorld';
import { Player } from '@/game/entities/Player';
import { Slime } from '@/game/entities/Slime';
import { ForestGuide } from '@/game/entities/ForestGuide';
import { WorldPickupItem } from '@/game/entities/WorldPickupItem';
import { CombatSystem } from '@/game/combat/CombatSystem';
import { CurrencySystem } from '@/game/systems/CurrencySystem';
import { ExperienceSystem } from '@/game/systems/ExperienceSystem';
import { QuestSystem } from '@/game/systems/QuestSystem';
import { characterStore } from '@/state/characterStore';
import { PLAYER_CONFIG, QUEST_REWARD, REACT_HUD_UPDATE_DISTANCE, SLIME_CONFIG } from '@/game/config/constants';
import { createInventoryItemById, createWorldPickupTextureKey } from '@/game/inventory/catalog';

type ControlKeys = {
  left: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
  jump: Phaser.Input.Keyboard.Key;
  pickup: Phaser.Input.Keyboard.Key;
  attack: Phaser.Input.Keyboard.Key;
  interact: Phaser.Input.Keyboard.Key;
  cursorLeft: Phaser.Input.Keyboard.Key;
  cursorRight: Phaser.Input.Keyboard.Key;
  cursorUp: Phaser.Input.Keyboard.Key;
};

export class GameScene extends Phaser.Scene {
  private player!: Player;

  private slimes: Slime[] = [];

  private guide!: ForestGuide;

  private worldItems: WorldPickupItem[] = [];

  private platforms!: Phaser.Physics.Arcade.StaticGroup;

  private keys!: ControlKeys;

  private combatSystem!: CombatSystem;

  private experienceSystem!: ExperienceSystem;

  private currencySystem!: CurrencySystem;

  private questSystem!: QuestSystem;

  private parallax!: ReturnType<typeof createParallaxBackground>;

  private worldBounds = { width: 0, height: 0 };

  private respawnPoint = new Phaser.Math.Vector2(0, 0);

  private guidePrompt!: Phaser.GameObjects.Text;

  private pickupPrompt!: Phaser.GameObjects.Text;

  private attackCooldownHintUntil = 0;

  private savedSnapshot!: SavedGameSnapshot;

  private readonly runtimeBridge = {
    respawnPlayer: () => this.respawnPlayer(),
    claimQuestReward: () => this.claimQuestReward(),
    dropInventoryItem: (itemId: string) => this.dropInventoryItem(itemId)
  };

  private unsubscribeCharacterStore?: () => void;

  public constructor() {
    super('GameScene');
  }

  public create(): void {
    this.savedSnapshot = {
      player: gameStore.getState().player,
      quest: gameStore.getState().quest,
      collectedPickupIds: gameStore.getState().collectedPickupIds,
      droppedPickups: gameStore.getState().droppedPickups
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
      character: characterStore.getState().character
    });

    this.unsubscribeCharacterStore = characterStore.subscribe(() => {
      this.player.characterRenderer.setCharacter(characterStore.getState().character);
    });

    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
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

    this.pickupPrompt = this.add.text(0, 0, 'לחץ S לאיסוף', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '18px',
      color: '#fff7d5',
      backgroundColor: 'rgba(6, 12, 24, 0.72)',
      padding: { left: 10, right: 10, top: 6, bottom: 6 }
    }).setOrigin(0.5).setDepth(30).setVisible(false);

    this.slimes = forestWorld.slimeSpawns.map((spawn) => new Slime(this, spawn.x, spawn.y, {
      onDefeated: (slime) => this.handleSlimeDefeated(slime)
    }));

    const droppedPickups = gameStore.getState().droppedPickups.map((pickup) => ({
      pickupId: pickup.pickupId,
      itemId: pickup.itemId,
      textureKey: createWorldPickupTextureKey(pickup.itemId),
      position: new Phaser.Math.Vector2(pickup.x, pickup.y)
    }));

    this.worldItems = [...forestWorld.pickupSpawns, ...droppedPickups]
      .filter((spawn) => !gameStore.getState().collectedPickupIds.includes(spawn.pickupId))
      .map((spawn) => new WorldPickupItem(this, spawn.position.x, spawn.position.y, {
        pickupId: spawn.pickupId,
        itemId: spawn.itemId,
        textureKey: spawn.textureKey
      }));

    this.addPhysicsInteractions();
    this.setupInput();
    this.configureCamera();
    this.setupEvents();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.unsubscribeCharacterStore?.();
      gameRuntime.unregister(this.runtimeBridge);
    });

    this.syncPlayerToStore();
    gameStore.setPrompt(null);

    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
  }

  public update(_time: number, _delta: number): void {
    this.parallax.update(this.cameras.main.scrollX);
    const activePickup = this.getActivePickup();
    this.updatePromptPosition(activePickup);

    if (this.player.isDead) {
      this.player.setVelocityX(0);
      this.player.setVelocityY(0);
      gameStore.setPrompt(null);
      this.guidePrompt.setVisible(false);
      this.pickupPrompt.setVisible(false);
      return;
    }

    const controls = this.getControls();
    this.player.updateControls(controls, this.time.now);

    if (controls.pickup && activePickup) {
      this.handleItemPickup(activePickup);
    }

    if (controls.interact && this.isNearGuide()) {
      gameStore.setDialogueOpen(true);
      gameStore.setQuestOpen(true);
      gameStore.setPrompt(null);
    }

    const guideNearby = this.isNearGuide();
    const showGuidePrompt = guideNearby && !activePickup && !gameStore.getState().ui.dialogueOpen;
    gameStore.setPrompt(activePickup ? 'לחץ S לאיסוף' : showGuidePrompt ? 'Press E' : null);
    this.guidePrompt.setVisible(showGuidePrompt);
    this.pickupPrompt.setVisible(Boolean(activePickup));

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

  public respawnPlayer(): void {
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

  public claimQuestReward(): void {
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

  public dropInventoryItem(itemId: string): void {
    const itemDefinition = createInventoryItemById(itemId);
    if (!itemDefinition) {
      return;
    }

    const pickupId = `dropped-${itemId}-${crypto.randomUUID()}`;
    const pickupX = this.player.x;
    const pickupY = this.player.y - 18;
    const pickup = new WorldPickupItem(this, this.player.x, this.player.y - 18, {
      pickupId,
      itemId,
      textureKey: createWorldPickupTextureKey(itemId),
      scale: 0.42
    });

    this.worldItems.push(pickup);
    gameStore.addDroppedPickup({ pickupId, itemId, x: pickupX, y: pickupY });
    this.spawnFlash(pickup.x, pickup.y, 0xffd899);
    this.spawnFloatingText(this.player.x, this.player.y - 72, `${itemDefinition.name} הושלך`, '#ffd79b');
  }

  private handleSlimeDefeated(slime: Slime): void {
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

  private handleItemPickup(item: WorldPickupItem): void {
    if (item.isCollected) {
      return;
    }

    const addedItem = gameStore.addInventoryItem(item.itemId);
    if (!addedItem) {
      return;
    }

    this.worldItems = this.worldItems.filter((worldItem) => worldItem !== item);
    if (item.pickupId.startsWith('dropped-')) {
      gameStore.removeDroppedPickup(item.pickupId);
    } else {
      gameStore.addCollectedPickupId(item.pickupId);
    }
    gameStore.setPrompt(null);
    gameStore.setNotification({ message: `${addedItem.name} נוסף לתיק.`, kind: 'success' });
    this.time.delayedCall(1800, () => gameStore.setNotification(null));

    this.spawnFlash(item.x, item.y, 0xb9e7ff);
    this.spawnHitParticles(item.x, item.y, 0xb9e7ff);
    this.spawnFloatingText(this.player.x, this.player.y - 88, `+ ${addedItem.name}`, '#bfe8ff');

    item.collectTo(this.player.x, this.player.y - 28, () => {
      this.pickupPrompt.setVisible(false);
    });
  }

  private addPhysicsInteractions(): void {
    this.physics.add.collider(this.player, this.platforms);
    for (const slime of this.slimes) {
      this.physics.add.collider(slime, this.platforms);
      this.physics.add.collider(this.player, slime, undefined, undefined, this);
    }
  }

  private setupInput(): void {
    const keys = this.input.keyboard?.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      jump: Phaser.Input.Keyboard.KeyCodes.SPACE,
      pickup: Phaser.Input.Keyboard.KeyCodes.S,
      attack: Phaser.Input.Keyboard.KeyCodes.X,
      interact: Phaser.Input.Keyboard.KeyCodes.E,
      cursorLeft: Phaser.Input.Keyboard.KeyCodes.LEFT,
      cursorRight: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      cursorUp: Phaser.Input.Keyboard.KeyCodes.UP
    }) as unknown as ControlKeys | undefined;

    if (!keys) {
      throw new Error('Keyboard input is unavailable');
    }

    this.keys = keys;
  }

  private configureCamera(): void {
    this.cameras.main.setDeadzone(220, 120);
    this.cameras.main.setLerp(0.08, 0.08);
  }

  private setupEvents(): void {
    this.events.on('combat:impact', (x: number, y: number) => {
      this.spawnHitParticles(x, y, 0xfff0a8);
    });
  }

  private getControls() {
    return {
      left: this.keys.left.isDown || this.keys.cursorLeft.isDown,
      right: this.keys.right.isDown || this.keys.cursorRight.isDown,
      jumpPressed: Phaser.Input.Keyboard.JustDown(this.keys.jump) || Phaser.Input.Keyboard.JustDown(this.keys.cursorUp),
      pickup: Phaser.Input.Keyboard.JustDown(this.keys.pickup),
      attackPressed: Phaser.Input.Keyboard.JustDown(this.keys.attack),
      interact: Phaser.Input.Keyboard.JustDown(this.keys.interact)
    };
  }

  private getActivePickup(): WorldPickupItem | null {
    let nearestPickup: WorldPickupItem | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const item of this.worldItems) {
      if (item.isCollected || !this.physics.world.overlap(this.player, item)) {
        continue;
      }

      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, item.x, item.y);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestPickup = item;
      }
    }

    return nearestPickup;
  }

  private isNearGuide(): boolean {
    return Phaser.Math.Distance.Between(this.player.x, this.player.y, this.guide.x, this.guide.y) <= REACT_HUD_UPDATE_DISTANCE;
  }

  private updatePromptPosition(activePickup: WorldPickupItem | null): void {
    this.guidePrompt.setPosition(this.guide.x, this.guide.y - 72);
    if (activePickup) {
      this.pickupPrompt.setPosition(activePickup.x, activePickup.y - 56);
    }
  }

  private clampPlayerState(): void {
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

  private syncPlayerToStore(): void {
    gameStore.patchPlayer({
      hp: this.player.health.currentHP,
      maxHp: this.player.health.maxHP,
      level: gameStore.getState().player.level,
      xp: gameStore.getState().player.xp,
      maxXp: gameStore.getState().player.maxXp,
      gold: gameStore.getState().player.gold
    });
  }

  private spawnFloatingText(x: number, y: number, text: string, color: string): void {
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

  private spawnFlash(x: number, y: number, tint: number): void {
    const flash = this.add.circle(x, y, 10, tint, 0.8).setDepth(35);
    this.tweens.add({
      targets: flash,
      scale: 2.8,
      alpha: 0,
      duration: 220,
      onComplete: () => flash.destroy()
    });
  }

  private spawnHitParticles(x: number, y: number, tint: number): void {
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