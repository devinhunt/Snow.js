/**
 * Snow.js
 * Add a little snow to your website.
 * By Devin Hunt (MIT Licensed)
 */

(function() {
    
    // Array Remove - By John Resig (MIT Licensed)
    Array.prototype.remove = function(from, to) {
        var rest = this.slice((to || from) + 1 || this.length);
        this.length = from < 0 ? this.length + from : from;
        return this.push.apply(this, rest);
    };
    
    /** 
     * Default options for spawning and controlling the snowflakes
     */ 
    var defaults = {
        spawnRate: 1,       // expressed in flakes per second 1 is a light snow. 100 is blizzard. 
        windAngle: 0,       // 0 is straight down. Math.PI is to the right
        windForce: .5       // .5 is normal force. 1 is gail force winds, lots of fluffing about.
    };
    
    /**
     * Flake Class
     * A single snowflake on the screen
     */
    function Flake(x, y) {
        this.age = 0;
        this.x = x;
        this.y = y;
        this.zDepth = Math.random() * 2 - 1;   // -1 to 1. 1 == very close the the 'camera'. 0 == in focus. 
        this.vx = Math.random() * 100 - 50;
        this.vy = 100 + this.zDepth * 50;     // make a depth of field using zdepth
        this.radius = Math.floor(Math.random() * 5) + 1;
        this.isMelted = false;
        
        this.el = document.createElement('div');
        this.el.className = 'flake';
        this.el.style.position = 'absolute';
        this.el.style.left = '0';
        this.el.style.top = '0';
        this.el.style.background = '#fff';
        this.el.style.opacity = Math.cos(this.zDepth * 1.5);
        this.el.style.boxShadow = '0px 0px 5px ' + this.zDepth * 10 + 'px #fff';
        this.el.style.borderRadius = this.radius + 'px';
        this.el.style.width = (this.radius * 2) + 'px';
        this.el.style.height = (this.radius * 2) + 'px';
        this.el.style.zIndex = '9999';
    }
    Flake.prototype = {
        /**
         * Update this snowflake.
         * @param dt Amount of time that has passed, in seconds
         */
        update: function(dt) {
            this.age += dt;
            this.x += this.vx * dt;
            this.y += this.vy * dt;
            
            if(this.age >= this.lifetime) {
                this.isMelted = true;
            }
            
            // blit style
            this.el.style.left = (this.x + Math.cos(this.age) * 20) + 'px';
            this.el.style.top = this.y + 'px';
        }
    };
    
    /**
     * Snow class. 
     * Generates and managaes Flakes 
     * @param ops Options for controlling the snow particle effects. 
     */
    window.Snow = function(ops) {
        // All the snowflakes we've got
        this.flakes = [];
        this.flakeCache = [];
        
        // make and attach our snowcontainer
        this.el = document.createElement('div');
        this.el.id = 'snowframe';
        this.el.className = 'snowframe';
        this.el.style.position = 'fixed';
        this.el.style.left = '0';
        this.el.style.top = '0';
        this.el.style.width = '100%';
        this.el.style.height = '100%';
        this.el.style.zIndex = '-1';
        this.el.style.overflow = 'hidden';
        document.body.insertBefore(this.el, document.body.firstChild);
    };
    Snow.prototype = {
        
        /**
         * Starts the snowfall
         */
        start: function() {
            this.isRunning = true;
            this.now = Date.now();
            
            var _this = this;
            setTimeout(function() { _this._update(); }, 10);
        },
        
        /**
         * Stops the simulation
         */
        stop: function() {
            this.isRunning = false;
        },
        
        /**
         * Updates the simulation
         */
        _update: function() {
            this.then = this.now;
            this.now = Date.now();
            var delta = (this.now - this.then) / 1000,
                bounds = {top: 0, right: this.el.scrollWidth, bottom: this.el.scrollHeight, left: 0},
                toCull = [],
                flake;
            
            // spawn new guys
            this._spawnFlakes(Math.floor(defaults.spawnRate * delta));
            
            for(var i = 0; i < this.flakes.length; i ++) {
                flake = this.flakes[i];
                flake.update(delta);
                
                // kill flakes off screen
                if(flake.x > bounds.right || flake.x < bounds.left || flake.y > bounds.bottom) {
                    toCull.push(i);
                }
            }
            
            while(toCull.length > 0) {
                this._killFlake(toCull.pop());
            }
            
            if(this.isRunning) {
                var _this = this;
                setTimeout(function() { _this._update(); }, 1);
            }
        },
        
        /**
         * Returns a flake for use
         */
        _getFlake: function() {
            if(this.flakeCache.length) {
                return this.flakeCache.pop();
            }
            return new Flake();
        },
        
        /**
         * Removes a from from active simulation
         * @param The index the flake is stored in the active 
         *        falkes array
         */
        _killFlake: function(index) {
            var flake = this.flakes[index];
            this.flakes.remove(index);
            
            // remove el from the dom and store the object
            this.el.removeChild(flake.el);
            this.flakeCache.push(flake);
        },
        
        /**
         * Create a number of snowflakes based on our options
         * @param count Number of flakes to spawn
         */
        _spawnFlakes: function(count) {
            var c = count || 1;
            for(var i = 0; i < c; i ++) {
                // TODO :: Need IE compat
                var x = Math.random() * window.innerWidth;
                var y = -10;
                var flake = this._getFlake();
                flake.x = x;
                flake.y = y;
                this.flakes.push(flake);
                this.el.appendChild(flake.el);
            }
        }
    };
})();