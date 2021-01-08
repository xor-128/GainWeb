function set_preloader_text(msg)
{
	$("#preloader-text").text(msg);
};

var gain = {
	playlist_json: null,
	
	filter_list: function(input)
	{
		var search_text = input.toLowerCase();

		for(var i = 0; i < playlist_json.playlist.length; i++)
		{
			var title = playlist_json.playlist[i].title.toLowerCase();
            var tags = playlist_json.playlist[i].tags?.toLowerCase();
            var category = playlist_json.playlist[i].contentCategory?.toLowerCase();
            
			if(category == undefined)
				category = "";

			            
			if(tags == undefined)
				tags = "";
							
			if(category?.indexOf(input) == -1 && title.indexOf(input) == -1 && tags.indexOf(input) == -1 && search_text != "")
			{
				$(`#__${i}`).css("display", "none");
			}
            else
            {
            	$(`#__${i}`).css("display", "block");
            }
		}
	},
	
	get_div: function(id, image_url, video_title, category, video_desc, links)
	{
		var part_1 = `<section id="__${id}" class="container"><div class="d-flex my-3"><div class="jumbotron w-100 py-5 mx-auto"><div class="row"><div class="img-container border border-dark col-md-4" style=" background-image: url(${image_url});" ></div> <div class="container col-md-8"><h1>${video_title}</h1> <h4>${category}</h4> <p class="lead">${video_desc}</p><div class="stick-to-bottom"> <div class="btn-group"> <button type="button" class="btn btn-danger dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">İzle</button> <div class="dropdown-menu" x-placement="bottom-start" style="position: absolute; transform: translate3d(0px, 38px, 0px); top: 0px; left: 0px; will-change: transform;">`;
		var part_2 = `</div></div></div></div></div></div></div></section>`;
		var out = "";
		
		out = part_1;
		
		for(var i = 0; i < links.length; i++)
		{
			out += `<a class="dropdown-item" href="${links[i].link}" target="_blank">${links[i].title}</a>`;
		}
		
		out += part_2;
		
		return out;
	},

	get_page_url: function(offset)
	{
		//Gizli playlist url'si. Değişebilir.
		return `http://cdn.jwplayer.com/v2/playlists/WqmRvXXa?internal=false&page_offset=${offset}&page_limit=500`;
	},
	
	download_json_data: function(_url)
	{
		let _data = null;
		
		$.ajax({
			async: false,
			dataType: "json",
			
			url: _url
		}).done(function(data) {
			_data = data;
		});
		
		return _data;
	},
	
	download_and_parse_data: function()
	{
		var data = gain.download_json_data(gain.get_page_url(1));
		
		if(data == null)
			return false;

		playlist_json = data;

		var final_div = "";
			
		for(var i = 0; i < data.playlist.length; i++)
		{
            var links = [];

            for(var it = 1; it < data.playlist[i].sources.length; it++)
            {
            	if(data.playlist[i].sources[it].type == "video/mp4")
            	    links.push({link: data.playlist[i].sources[it].file, title: data.playlist[i].sources[it].label});
            }

            links.sort(function(a, b) {
			  return parseInt(a.title.substr(0, a.title.length -1)) - parseInt(b.title.substr(0, b.title.length -1));
			});

			var category = data.playlist[i].contentCategory;
            
			if(category == undefined)
				category = "";

            var div = gain.get_div(i, data.playlist[i].image, data.playlist[i].title, category,data.playlist[i].description, links);
		    
		    final_div += div;
		}

		$("main").html($("main").html() + final_div);
		
		return true;
	},	
	
	load_parser: function()
	{
		if(!gain.download_and_parse_data())
			return false;

		$("#search-plate").on('input', (e) =>
		{
			gain.filter_list($("#search-plate").val());
		});
		
		return true;
	}
}

!(function($) {	
	function init() {
		set_preloader_text("Liste indiriliyor.");
		
		if(!gain.load_parser())
		{
			set_preloader_text("Bir hata oluştu. Sayfayı yeniden yükleyin.");
			return;
		}

		set_preloader_text("Liste yüklendi.");
		
		if ($('#preloader').length) {
			$('#preloader').delay(100).fadeOut('slow', function() {
				$(this).remove(); 
			});
		}
	}
	
	$(window).on('load', function() {
		init();
	});
  
})(jQuery);