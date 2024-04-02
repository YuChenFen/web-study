export default class Flip {
    constructor(element, options = null) {
        this.element = element;
        this.first = element.getBoundingClientRect();
        this.options = options ? options : {
            duration: 500,
            easing: 'ease-in-out'
        };
    }
    updateFirst(){
        this.first = this.element.getBoundingClientRect();
    }

    play(options=null){
        let last = this.element.getBoundingClientRect();
        let delta = {
            x: this.first.x - last.x,
            y: this.first.y - last.y,
            width: this.first.width / last.width,
            height: this.first.height / last.height
        };
        let player = this.element.animate([
            {
                transformOrigin: 'top left',
                transform: `
                translate(${delta.x}px, ${delta.y}px) 
                scale(${delta.width}, ${delta.height})`
            },
            {
                transformOrigin: 'top left',
                transform: 'none'
            }
        ], options ? options : this.options);
        player.onfinish = () => {
            this.updateFirst();
        };
    }

}