
;
(function ($) {


    var GesturePasswd= function (element, options) {
        this.$element	= $(element);
        this.options	= options;
        var that=this;
        this.pr=options.pointRadii;
        this.rr=options.roundRadii;
        this.o=options.space;
        this.color=options.color;
        //全局样式
        this.$element.css({
            "position":"relation",
            "width":this.options.width,
            "height":this.options.height,
            "background-color":options.backgroundColor,
            "overflow":"hidden",
            "cursor":"default"
        });


        //选择器规范
        if(! $(element).attr("id"))
            $(element).attr("id",(Math.random()*65535).toString());
        this.id="#"+$(element).attr("id");



        var Point = function (x,y){
            this.x  =x;this.y=y
        };

        this.result="";
        this.pList=[];
        this.sList=[];
        this.tP=new Point(0,0);


        this.$element.append('<canvas class="main-c" width="'+options.width+'" height="'+options.height+'" >');
        //this.$element.append('<canvas class="main-p" width="'+options.width+'" height="'+options.height+'" >');
        this.$c= $(this.id+" .main-c")[0];
        this.$ctx=this.$c.getContext('2d');




        this.initDraw=function(){
            this.$ctx.strokeStyle=this.color;
            this.$ctx.lineWidth=2;
            for(var j=0; j<3;j++ ){
                for(var i =0;i<3;i++){
                    this.$ctx.moveTo(this.o/2+this.rr*2+i*(this.o+2*this.rr),this.o/2+this.rr+j*(this.o+2*this.rr));
                    this.$ctx.arc(this.o/2+this.rr+i*(this.o+2*this.rr),this.o/2+this.rr+j*(this.o+2*this.rr),this.rr,0,2*Math.PI);
                    var tem=new Point(this.o/2+this.rr+i*(this.o+2*this.rr),this.o/2+this.rr+j*(this.o+2*this.rr));
                    if (that.pList.length < 9)
                        this.pList.push(tem);
                }
            }
            this.$ctx.stroke();
            this.initImg=this.$ctx.getImageData(0,0,this.options.width,this.options.height);
        };
        this.initDraw();
        //this.$ctx.stroke();
        this.isIn=function(x,y){

            for (var p in that.pList){
                //console.log(that.pList[p][x]);
                //  console.log(( Math.pow((x-that.pList[p][x]),2)+Math.pow((y-that.pList[p][y]),2)));
                if(( Math.pow((x-that.pList[p]["x"]),2)+Math.pow((y-that.pList[p]["y"]),2) ) < Math.pow(this.rr,2)){
                    return that.pList[p];
                }
            }
            return 0;
        };

        this.pointDraw =function(c){
            if (arguments.length>0){
                that.$ctx.strokeStyle=c;
                that.$ctx.fillStyle=c;
            }
            for (var p in that.sList){
                that.$ctx.moveTo(that.sList[p]["x"]+that.pr,that.sList[p]["y"]);
                that.$ctx.arc(that.sList[p]["x"],that.sList[p]["y"],that.pr,0,2*Math.PI);
                that.$ctx.fill();
            }
        };
        this.lineDraw=function (c){
            if (arguments.length>0){
                that.$ctx.strokeStyle=c;
                that.$ctx.fillStyle=c;
            }
            if(that.sList.length > 0){
                for( var p in that.sList){
                    if(p == 0){
                        //console.log(that.sList[p]["x"],that.sList[p]["y"]);
                        that.$ctx.moveTo(that.sList[p]["x"],that.sList[p]["y"]);
                        continue;
                    }
                    that.$ctx.lineTo(that.sList[p]["x"],that.sList[p]["y"]);
                    //console.log(that.sList[p]["x"],that.sList[p]["y"]);
                }

            }
        };

        this.allDraw =function(c){
            if (arguments.length>0){
                this.pointDraw(c);
                this.lineDraw(c);
                that.$ctx.stroke();
            }
            else {
                this.pointDraw();
                this.lineDraw();
            }

        };


        this.draw=function(x,y){
            that.$ctx.clearRect(0,0,that.options.width,that.options.height);
            that.$ctx.beginPath();
            //that.initDraw();
            that.$ctx.putImageData(this.initImg,0,0);
            that.$ctx.lineWidth=4;
            that.pointDraw(that.options.lineColor);
            that.lineDraw(that.options.lineColor);
            that.$ctx.lineTo(x,y);
            that.$ctx.stroke();
        };

        this.pointInList=function(poi,list){
            for (var p in list){
                if( poi["x"] == list[p]["x"] && poi["y"] == list[p]["y"]){
                    return ++p;
                }
            }
            return false;
        };

        this.touched=false;
        $(this.id).on ("mousedown touchstart",{that:that},function(e){
            e.data.that.touched=true;
        });
        $(this.id).on ("mouseup touchend",{that:that},function(e){
            e.data.that.touched=false;
            that.$ctx.clearRect(0,0,that.options.width,that.options.height);
            that.$ctx.beginPath();
            that.$ctx.putImageData(e.data.that.initImg,0,0);
            that.allDraw(that.options.lineColor);
            // that.$ctx.stroke();
            for(var p in that.sList){
                if(e.data.that.pointInList(that.sList[p], e.data.that.pList)){
                    e.data.that.result= e.data.that.result+(e.data.that.pointInList(that.sList[p], e.data.that.pList)).toString();
                }
            }
            $(element).trigger("hasPasswd",that.result);
        });

        $(this.id).on('touchmove mousemove',{that:that}, function(e) {
            if(e.data.that.touched){
                var x= e.pageX || e.originalEvent.targetTouches[0].pageX ;
                var y = e.pageY || e.originalEvent.targetTouches[0].pageY;
                x=x-that.$element.offset().left;
                y=y-that.$element.offset().top;
                var p = e.data.that.isIn(x, y);
                //console.log(x)
                if(p != 0 ){
                    if ( !e.data.that.pointInList(p,e.data.that.sList)){
                        e.data.that.sList.push(p);
                    }
                }
                //console.log( e.data.that.sList);
                e.data.that.draw(x, y);
            }

        });

        $(this.id).on('passwdWrong',{that:that}, function(e) {
            that.$ctx.clearRect(0,0,that.options.width,that.options.height);
            that.$ctx.beginPath();
            that.$ctx.putImageData(that.initImg,0,0);
            that.allDraw("#cc1c21");
            that.result="";
            that.pList=[];
            that.sList=[];

            setTimeout(function(){
                that.$ctx.clearRect(0,0,that.options.width,that.options.height);
                that.$ctx.beginPath();
                that.initDraw()
            },500)

        });


        $(this.id).on('passwdRight',{that:that}, function(e) {
            that.$ctx.clearRect(0,0,that.options.width,that.options.height);
            that.$ctx.beginPath();
            that.$ctx.putImageData(that.initImg,0,0);
            that.allDraw("#00a254");
            that.result="";
            that.pList=[];
            that.sList=[];
            setTimeout(function(){
                that.$ctx.clearRect(0,0,that.options.width,that.options.height);
                that.$ctx.beginPath();
                that.initDraw()
            },500)
        });


    };


    GesturePasswd.DEFAULTS = {
        zindex :100,
        roundRadii:25,
        pointRadii:6,
        space:30,
        width:240,
        height:240,
        lineColor:"#00aec7",
        backgroundColor:"#252736",
        color:"#FFFFFF"
    };

    function Plugin(option,arg) {
        return this.each(function () {
            var $this   = $(this);
            var options = $.extend({}, GesturePasswd.DEFAULTS, typeof option == 'object' && option);
            var data    = $this.data('GesturePasswd');
            var action  = typeof option == 'string' ? option : NaN;
            if (!data) $this.data('danmu', (data = new GesturePasswd(this, options)));
            if (action)	data[action](arg);
        })
    }


    $.fn.GesturePasswd             = Plugin;
    $.fn.GesturePasswd.Constructor = GesturePasswd;



})(jQuery);
