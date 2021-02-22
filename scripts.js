function set_preloader_text(msg) {
  $("#preloader-text").text(msg);
};

var gain = {
    main_playlist_json: null,

    input_changed: function(input) {
      if (input.length > 0) return;

      $('main').children('section').each(function() {
        if ($(this).hasClass('main-feed'))
          $(this).css("display", "block");
        else
          $(this).remove();
      });
    },

    filter_list: function(search_text) {

      if (search_text.length <= 0) return;

      $('#preloader').fadeIn('fast');
      set_preloader_text('Liste yükleniyor.');

      $('main').children('section').each(function() {
        if ($(this).hasClass('main-feed'))
          $(this).css("display", "none");
        else
          $(this).remove();
      });

      var data = gain.download_json_data(gain.get_page_url('1GaoV3X7') + "&search=" + encodeURI(search_text));
		
	  window.history.pushState('index', 'Arama - ' + search_text, '/index.html?search=' + encodeURI(search_text));
	  document.title = 'Arama - ' + search_text;
	  
      if (data.playlist?.length <= 0) {
        $('main').children('section').each(function() {
          if ($(this).hasClass('main-feed'))
            $(this).css("display", "block");
          else
            $(this).remove();
        });

        $('#preloader').delay(100).fadeOut('fast');

        return;
      }

      for (var i = 0; i < data.playlist.length; i++) {
        var links = [];

        for (var it = 1; it < data.playlist[i].sources.length; it++) {
          if (data.playlist[i].sources[it].type == "video/mp4")
            links.push({
              link: data.playlist[i].sources[it].file,
              title: data.playlist[i].sources[it].label
            });
        }

        links.sort(function(a, b) {
          return parseInt(a.title.substr(0, a.title.length - 1)) - parseInt(b.title.substr(0, b.title.length - 1));
        });

        var category = data.playlist[i].contentCategory?.toLowerCase();

        if (category == undefined)
          tags = "";

        var div = gain.get_div("search-item", data.playlist[i].image, data.playlist[i].title, data.playlist[i].contentCategory, data.playlist[i].description, links, data.playlist[i]?.playlistId);

        div.css('opacity', 0);

        $("main").append(div);
      }

      $('main').children('section').each(function() {
        if ($(this).hasClass('search-item')) {
          $(this).delay(300).animate({
            opacity: 1.0
          });
        }
      });

      $('#preloader').delay(100).fadeOut('fast');
    },

    get_div: function(type, image_url, video_title, category, video_desc, links, playlistId) {
      var button_group_div = $("<div/>", {
        "class": "btn-group"
      });

      var dropdown_menu_div = $("<div/>", {
        "class": "dropdown-menu dropdown-menu-grey",
        "x-placement": "bottom-start"
      });

      var download_button = $("<button/>", {
        "type": "button",
        "class": "btn btn-danger dropdown-toggle",
        "data-toggle": "dropdown",
        "aria-haspopup": "true",
        "aria-expanded": "false",
        text: "İzle"
      });
	  
	  var other_episodes_button = null;
	  
	  if(playlistId != null)
	  {
		   other_episodes_button = $("<button/>", {
			"type": "button",
			"class": "btn btn-danger ml-1 rounded-top rounded-bottom rounded-left rounded-right",
			"aria-haspopup": "true",
			"aria-expanded": "false",
			text: "Diğer bölümler"
		  });
		  
		  other_episodes_button.on('click', (e) => {
			  document.location = "index.html?playlist=" + playlistId;
		  });
	  }

      for (var i = 0; i < links.length; i++) {
        dropdown_menu_div.append($("<a/>", {
          "class": "dropdown-item",
          "target": "_blank",
          "text": links[i].title,
          "href": links[i].link
        }));
      }

      button_group_div.append(download_button);
      button_group_div.append(dropdown_menu_div);
	  if(playlistId != null)
	  {
		button_group_div.append(other_episodes_button);
	  }

      var stick_to_bottom_div = $("<div/>", {
        "class": "stick-to-bottom"
      });

      stick_to_bottom_div.append(button_group_div);

      var title_h1 = $("<h1/>", {
        text: video_title
      });

      var category_h4 = $("<h4/>", {
        text: category
      });

      var desc_p = $("<p/>", {
        "class": "lead",
        text: video_desc
      });

      var container_div = $("<div/>", {
        "class": "container col-md-8"
      }).append(title_h1).append(category_h4).append(desc_p).append(stick_to_bottom_div);

      var image_div = $("<div/>", {
        "class": "img-container border border-dark col-md-4",
        "style": `background-image: url(${image_url});`
      });

      var row_div = $("<div/>", {
        "class": "row"
      }).append(image_div).append(container_div);

      var jumbotron_div = $("<div/>", {
        "class": "jumbotron w-100 py-5 mx-auto"
      }).append(row_div);

      var flex_div = $("<div/>", {
        "class": "d-flex my-3"
      }).append(jumbotron_div);

      var section_part = $("<section/>", {
        "class": type + " container"
      }).append(flex_div);

      return section_part;
    },

    get_page_url: function(key) {
      return `http://cdn.jwplayer.com/v2/playlists/${key}?page_limit=500`;
    },

    download_json_data: function(_url) {
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

    download_and_parse_data: function(isSearch, playlistIdOrSearchQuery) {
	  if(isSearch)
	  {
		  $('#search-input').val(playlistIdOrSearchQuery);
		  gain.filter_list(playlistIdOrSearchQuery);
		  return true;
	  }
	  
      var data = gain.download_json_data(gain.get_page_url(playlistIdOrSearchQuery));

      if (data == null)
        return false;

      main_playlist_json = data;

      var final_div = "";

      for (var i = 0; i < data.playlist.length; i++) {
        var links = [];

        for (var it = 1; it < data.playlist[i].sources.length; it++) {
          if (data.playlist[i].sources[it].type == "video/mp4")
            links.push({
              link: data.playlist[i].sources[it].file,
              title: data.playlist[i].sources[it].label
            });
        }

        links.sort(function(a, b) {
          return parseInt(a.title.substr(0, a.title.length - 1)) - parseInt(b.title.substr(0, b.title.length - 1));
        });

        var category = data.playlist[i].contentCategory;

        if (category == undefined)
          category = "";

        var div = gain.get_div("main-feed", data.playlist[i].image, data.playlist[i].title, category, data.playlist[i].description, links, data.playlist[i]?.playlistId);

        $("main").append(div);
      }

      return true;
    },

    load_parser: function() {
	  var url = new URL(document.location);
	  var search = url.searchParams.get("search");
	  var playlist = url.searchParams.get("playlist");
	  
      if (!gain.download_and_parse_data(search != null, (search == null) ? ((playlist == null) ? 'WqmRvXXa' : playlist) : search))
        return false;

      $("#search-input").on('input', function(e) {
        gain.input_changed($(this).val());
      });

      $("#search-input").on('keypress', (e) => {
        if (e.which == 13) {
          gain.filter_list($('#search-input').val());
        }
      });

      $("#search-button").on('click', (e) => {
        gain.filter_list($('#search-input').val());
      });

      return true;
    }
}

  !(function($) {
    function init() {
      set_preloader_text("Liste indiriliyor.");

      if (!gain.load_parser()) {
        set_preloader_text("Bir hata oluştu. Sayfayı yeniden yükleyin.");
        return;
      }
      set_preloader_text("Liste yüklendi.");

      $(".navbar-logo").on('click', (e) => {
        window.location = 'index.html';
      });

      $('#preloader').delay(100).fadeOut('slow');
    }

    $(window).on('load', function() {
      init();
    });

  })(jQuery);
