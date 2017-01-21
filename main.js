function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
    var scaleBy = scaleBy || 1;
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } else if (this.isDone()) {
        return;
    }
    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    var vindex = 0;
    if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
        index -= Math.floor(this.spriteSheet.width / this.frameWidth);
        vindex++;
    }

    var locX = x;
    var locY = y;
    var offset = vindex === 0 ? this.startX : 0;
    ctx.drawImage(this.spriteSheet,
                  index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
                  this.frameWidth, this.frameHeight,
                  locX, locY,
                  this.frameWidth * scaleBy,
                  this.frameHeight * scaleBy);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

function Background(game) {
    Entity.call(this, game, 0, 400);
    this.radius = 200;
}

Background.prototype = new Entity();
Background.prototype.constructor = Background;

Background.prototype.update = function () {
}

Background.prototype.draw = function (ctx) {
    ctx.fillStyle = "SaddleBrown";
    ctx.fillRect(0,500,800,300);
    Entity.prototype.draw.call(this);
}

function GunWoman(game) {
    // 192, 192, 4, 0.05, 14, true, 2
    this.idleAni = new Animation(ASSET_MANAGER.getAsset("./images/gunwomanIDLEright-sheet.png"), 0, 0, 192, 192, 0.02, 22, true, true);
    this.walkAni = new Animation(ASSET_MANAGER.getAsset("./images/gunwomanWALKright-sheet.png"), 0, 0, 192, 192, 0.02, 14, false, true);
    this.attackAni = new Animation(ASSET_MANAGER.getAsset("./images/gunwomanATTACKright-sheet.png"), 0, 0, 384, 192, 0.02, 23, false, true);

    this.attack = false;
    this.walk = false;
    this.radius = 100;
    this.ground = 400;
    Entity.call(this, game, 0, 400);
}

GunWoman.prototype = new Entity();
GunWoman.prototype.constructor = GunWoman;

GunWoman.prototype.update = function () {
    if (this.game.space) this.attack = true;
    if (this.game.arrRight) this.walk = true;
    if (this.attack) {
        if (this.attackAni.isDone()) {
            this.attackAni.elapsedTime = 0;
            this.attack = false;
        }
    
    }
    else if (this.walk) {
        if (this.walkAni.isDone() && !this.game.arrRight) {
            this.walkAni.elapsedTime = 0;
            this.walk = false;
        }
    
    }
    Entity.prototype.update.call(this);
}

GunWoman.prototype.draw = function (ctx) {
    if (this.attack) {
        this.attackAni.drawFrame(this.game.clockTick, ctx, this.x - 95 , this.y);
    } else if (this.walk) {
        this.walkAni.drawFrame(this.game.clockTick, ctx, this.x , this.y );
    }
    else {
        this.idleAni.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    }
    Entity.prototype.draw.call(this);
}

// the "main" code begins here

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./images/gunwomanWALKright-sheet.png");
ASSET_MANAGER.queueDownload("./images/gunwomanATTACKright-sheet.png");
ASSET_MANAGER.queueDownload("./images/gunwomanIDLEright-sheet.png");



ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    var gameEngine = new GameEngine();
    var bg = new Background(gameEngine);
    var gunWoman = new GunWoman(gameEngine);

    gameEngine.addEntity(bg);
    gameEngine.addEntity(gunWoman);
 
    gameEngine.init(ctx);
    gameEngine.start();
});
