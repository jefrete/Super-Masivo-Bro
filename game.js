const config = {
    type: Phaser.AUTO,
    width: 800, // Cambié el tamaño para un canvas más amplio y funcional
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

// Variables globales
let player;
let platforms;
let cursors;
let coins;
let score = 0;
let scoreText;

function preload() {
    this.load.image('sky', 'https://labs.phaser.io/assets/skies/sky4.png');
    this.load.image('floorbricks', 'floorbricks.png'); // Cambié a una URL válida
    this.load.image('coin', 'hongo.png'); // Cambié a una URL válida
    this.load.spritesheet('dude', 'mario.png', { frameWidth: 18, frameHeight: 16 });
}

function create() {
    // Fondo adaptado al tamaño de la pantalla
    const background = this.add.image(0, 0, 'sky').setOrigin(0, 0);
    background.displayWidth = config.width;
    background.displayHeight = config.height;

    // Crear plataformas
    platforms = this.physics.add.staticGroup();
    platforms.create(0,config.height - 16, 'floorbricks').setOrigin(0,0.5).refreshBody(); // Plataforma larga
    platforms.create(200,config.height - 16, 'floorbricks').setOrigin(0,0.5).refreshBody(); // Plataforma larga
    platforms.create(300,config.height - 16, 'floorbricks').setOrigin(0,0.5).refreshBody(); // Plataforma larga
    platforms.create(450,config.height - 16, 'floorbricks').setOrigin(0,0.5).refreshBody(); // Plataforma larga
    platforms.create(600,config.height - 16, 'floorbricks').setOrigin(0,0.5).refreshBody(); // Plataforma larga
    
    // Jugador
    player = this.physics.add.sprite(100, 100, 'dude');
    player.setBounce(0);
    player.setCollideWorldBounds(true);
    player.setScale(3); // Escalar el sprite
    player.setOrigin(0, 1);
    player.setGravityY(300);

    // Animaciones del jugador
    this.anims.create({
        key: 'mario-walk',
        frames: this.anims.generateFrameNumbers('dude', { start: 1, end: 3 }),
        frameRate: 12,
        repeat: -1
    });

    this.anims.create({
        key: 'mario-idle',
        frames: [{ key: 'dude', frame: 0 }],
        frameRate: 20
    });

    this.anims.create({
        key: 'mario-jump',
        frames: [{ key: 'dude', frame: 5 }],
        frameRate: 20
    });


    this.physics.world.setBounds(0, 0, 2000, config.height);
    this.cameras.main.setBounds(0, 0, 2000, config.height);
    this.cameras.main.startFollow(player); // Cambiado a `player`, no `this.player`

    // Colisión jugador-plataformas
    this.physics.add.collider(player, platforms);

    // Controles del teclado
    cursors = this.input.keyboard.createCursorKeys();

    // Monedas
    coins = this.physics.add.group({
        key: 'coin',
        repeat: 10,
        setXY: { x: 200, y: 0, stepX: 100 }
    });

    coins.children.iterate(coin => {
        coin.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    // Colisión monedas-plataformas
    this.physics.add.collider(coins, platforms);

    // Superposición jugador-monedas
    this.physics.add.overlap(player, coins, collectCoin, null, this);

    // Puntuación
    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });

}

function update() {
    // Control de movimiento
    if (cursors.left.isDown) {
        player.setVelocityX(-160); // Movimiento a la izquierda
        player.anims.play('mario-walk', true); // Animación de caminar
        player.flipX = true; // Voltear el sprite hacia la izquierda
    } else if (cursors.right.isDown) {
        player.setVelocityX(160); // Movimiento a la derecha
        player.anims.play('mario-walk', true); // Animación de caminar
        player.flipX = false; // Asegurar que el sprite no esté volteado
    } else {
        player.setVelocityX(0); // Detener movimiento horizontal
        player.anims.play('mario-idle', true); // Animación de estar quieto
    }

    // Control de salto
    if (cursors.up.isDown && player.body.touching.down ) {
        player.setVelocityY(-400); // Saltar
        player.anims.play('mario-jump', true); // Animación de salto
    }
}

function collectCoin(player, coin) {
    coin.disableBody(true, true); // Desactivar moneda

    // Incrementar puntuación
    score += 10;
    scoreText.setText('Score: ' + score);
}
