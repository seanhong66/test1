function zoomIn() {
    var curSize= parseInt($('#notes').css('font-size')) + 2;
    if(curSize<=26) {
        $('#notes').css('font-size', curSize);
    }
}

function zoomOut() {
    var curSize= parseInt($('#notes').css('font-size')) - 2;
    if(curSize>=10) {
        $('#notes').css('font-size', curSize);
    }
}

var zoomBtn = '<div style="background: #333333; width:60px; height:20px; border-radius:5px; font-size: 14px !important" align="center"><button class="btn btnNarrow" onclick="zoomIn()">A+</button><button class="btn btnNarrow" onclick="zoomOut()">A-</button><br/></div>';

var JsonNotes = '';
var CurrentSlide = '';

mw.kalturaPluginWrapper(function(){
    mw.PluginManager.add('myCustomPluginName', mw.KBaseComponent.extend({

		defaultConfig: {
			"align": "middle" ,
			"parent": "controlContainer" ,
			"order": 60 ,
			"showTooltip": true ,
			"displayImportance": "high" ,
		} ,
		
		loadEntryinfo: function() {
		    var kdp = this.getPlayer(); 
		    var customDataList = kdp.evaluate('{mediaProxy.entryMetadata}');
		    var noteStr = ((customDataList["Body"]));
		    try{
		        JsonNotes = JSON.parse(noteStr);
		        CurrentSlide =  JsonNotes["Notes"][0];
		   }
		    catch(err){
		        JsonNotes = '';
		       CurrentSlide = '';
		    }
		},
		
		setup: function () {
		    //Load the notes
		    this.loadEntryinfo();
		    this.addBindings();   
		},
		
		addBindings: function() {
		    var _this = this;
            this.bind('playlistFirstEntry', function(){
                _this.loadEntryinfo();
                $("#notes").html('<div style="padding:10px">' + zoomBtn + CurrentSlide + '</div'); 
            });
            this.bind('playlistMiddleEntry', function(){
                _this.loadEntryinfo();
                $("#notes").html('<div style="padding:10px">' + zoomBtn + CurrentSlide + '</div'); 
            });
            this.bind('playlistLastEntry', function(){
                _this.loadEntryinfo();
                $("#notes").html('<div style="padding:10px">' + zoomBtn + CurrentSlide + '</div'); 
            });
            this.bind('playerReady', function(){
                _this.setFirstSlide();
            });
            this.bind('monitorEvent', function(){
                _this.UpdateNotes();
            });
        },
        
        setFirstSlide: function(){
            var _this = this; 
            try{
                if (JsonNotes["Timestamps"].length >0)
                    _this.getPlayer().sendNotification("doSeek",1);
            }
            catch(err){}
            
        },
        
        UpdateNotes: function(){
            var _this = this; 
		    var e = parseInt(_this.getPlayer().evaluate("{video.player.currentTime}"));
		    
		    //Change Notes
		    try{
		        var tIndex = 0;
		        while ( JsonNotes["Timestamps"][tIndex] <= e ) {tIndex++;}
		        tIndex--;
		        CurrentSlide =  JsonNotes["Notes"][tIndex];
		    }
		    catch(err){
		        CurrentSlide = ''; 
		    }
		    $("#notes").html('<div style="padding:10px">' + zoomBtn + CurrentSlide + '</div'); 
        },
		
		isSafeEnviornment: function () {
			return true;
		} ,
		getComponent: function () {
		    var _this = this;
		    
		   
		    
			if ( !this.$el ) {
				var nextBtn = $( '<button><b>></b></button>' )
					.attr( 'title', 'Next Slide' )
					.addClass( "btn btnNarrow " )
					.click(function() {
					     _this.GoToNextSlide();
					});
				var prevBtn = $( '<button><b><</b></button>' )
					.attr( 'title', 'Previous Slide' )
					.addClass( "btn btnNarrow" )
					.click(function() {
					     _this.GoToPreviousSlide();
					});
				var noteBtn = $( '<button ><B>N</B></button>' )
    				.attr( 'title', 'Notes' )
    				.addClass( "btn btnNarrow" )
    				.click(function() {
    				    _this.toggleExpend();
    				});
    			var e = parseInt(_this.getPlayer().evaluate("{video.player.height}"));
    			e = parseInt(e*20);
    			e = parseInt(e/100);
		    
    		    var infoDiv = $( "<div id='notes' style='resize: none; display: none !important; background:#128BAB; color:white; font-family:sans-serif; width:100%; height: " + e + "px;overflow:auto; font-size:14px;'></div>" );
				var layoutClass = ' ' + this.getConfig('layout');
				this.$el = $('<div style="width: 100px; display:inline; height:100%;"/>')
					.addClass( this.getCssClass() + layoutClass )
					.append(noteBtn, prevBtn, nextBtn,infoDiv);
			}
			return this.$el;
		} ,

		toggleExpend: function () {
		     $("#notes").html('<div style="padding:10px">' + zoomBtn + CurrentSlide + '</div'); 
			if(!$('#notes').is(":visible")) {
			    $('#notes').show();
			} else {
			    $('#notes').hide();
			}
			/*
			if (!$(".icon-contract").length) {
		        $(".icon-expand").click();
		        $(".icon-contract").click();
			}
			*/
		},
		
		GoToNextSlide: function(){
		    var _this = this; 
		    _this.getPlayer().sendNotification("doPause");
		    var e = parseInt(_this.getPlayer().evaluate("{video.player.currentTime}"));
		    //Change Notes
		    try{
		        var tIndex = 0;
		        while ( JsonNotes["Timestamps"][tIndex] <= e ) {tIndex++;} 
		        
		        if (JsonNotes["Timestamps"].length == tIndex ) {
		            tIndex--;
		        }
		        
		        CurrentSlide =  JsonNotes["Notes"][tIndex];
		        _this.getPlayer().sendNotification("doSeek",JsonNotes["Timestamps"][tIndex]);
		    }catch(err){
		        CurrentSlide = ''; 
		    }
		    $("#notes").html('<div style="padding:10px">' + zoomBtn + CurrentSlide + '</div'); 
		},
		
		GoToPreviousSlide: function(){
		    var _this = this; 
		    _this.getPlayer().sendNotification("doPause");
		    var e = parseInt(_this.getPlayer().evaluate("{video.player.currentTime}"));
		    try{
		        var tIndex = 0;
		        while ( JsonNotes["Timestamps"][tIndex] <= e ) {tIndex++;} 
		        tIndex -=2;
		        if (tIndex < 0 ) {tIndex=0;}
		        _this.getPlayer().sendNotification("doSeek",JsonNotes["Timestamps"][tIndex]);
		        CurrentSlide =  JsonNotes["Notes"][tIndex];
		    }catch(err){
		        CurrentSlide='';
		    }
		    $("#notes").html('<div style="padding:10px">' + zoomBtn + CurrentSlide + '</div');
		}
	}));
});
