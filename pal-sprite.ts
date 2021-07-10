namespace sprites {
    export class PaletteSprite extends Sprite {

        private map: number[];

        constructor(img: Image) {
            super(img);
            this.setPaletteMap([]);
        }

        public setPaletteMap(map: number[]) {
            this.map = map.slice();
            this.map[0] = 0; // don't remap transparency
            for (let i = this.map.length; i < 16; ++i) {
                this.map[i] = i;
            }
            for (let i = 0; i < 16; ++i) {
                if (this.map[i] < 0) { this.map[i] = i; }
            }
        }

        /**
         * Map a palette color
         */
        //% group="Palette"
        //% weight=10
        //% blockId=palspritemapcolor block="map %sprite(mySprite) color from %from to %to"
        //% flag.defl=SpriteFlag.AutoDestroy
        //% help=sprites/sprite/set-flag
        public setPaletteMapColor(src: number, dst: number) {
            if (src < 1 || src > 15 || dst < 1 || dst > 15) return;
            this.map[src] = dst;
        }

        __drawCore(camera: scene.Camera) {
            if (this.isOutOfScreen(camera)) return;

            const ox = (this.flags & sprites.Flag.RelativeToCamera) ? 0 : camera.drawOffsetX;
            const oy = (this.flags & sprites.Flag.RelativeToCamera) ? 0 : camera.drawOffsetY;

            const l = Math.floor(this.left - ox);
            const t = Math.floor(this.top - oy);

            image.drawPaletteMappedImage(image.screenImage(), this.image, this.map, l, t, true);
        }
    }


    /**
     * Create a new palette sprite from an image
     * @param img the image
     */
    //% group="Create"
    //% blockId=palspritescreate block="palette sprite %img=screen_image_picker of kind %kind=spritekind"
    //% expandableArgumentMode=toggle
    //% blockSetVariable=mySprite
    //% weight=100 help=sprites/create
    export function createPaletteSprite(img: Image, kind?: number): PaletteSprite {
        const scene = game.currentScene();
        const sprite = new PaletteSprite(img);
        sprite.setKind(kind);
        scene.physicsEngine.addSprite(sprite);

        // run on created handlers
        scene.createdHandlers
            .filter(h => h.kind == kind)
            .forEach(h => h.handler(sprite));

        return sprite;
    }

    /**
     * Create a new palette sprite from an image
     * @param img the image
     */
    //% group="Create"
    //% blockId=palspritescreatenoset block="paletted sprite %img=screen_image_picker of kind %kind=spritekind"
    //% expandableArgumentMode=toggle
    //% weight=99 help=sprites/create
    export function __createPaletteSprite(img: Image, kind?: number): PaletteSprite {
        return sprites.createPaletteSprite(img, kind);
    }
}

namespace image {
    export function drawPaletteMappedImage(dst: Image, src: Image, map: number[], left: number, top: number, transparent: boolean) {
        // TODO: Move into common packages -- make performant
        for (let y = 0; y < src.height; ++y) {
            for (let x = 0; x < src.width; ++x) {
                const color = map[src.getPixel(x, y)];
                if (color || !transparent) {
                    dst.setPixel(x + left, y + top, color);
                }
            }
        }
    }
}