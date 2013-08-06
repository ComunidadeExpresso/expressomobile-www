var scrollDetail,
	scroll,
	scrollMenu;
var pullDownEl, pullDownOffset,
	pullUpEl, pullUpOffset,
	generatedCount = 0;

function loaded() 
{

	// var winWidth = $(window).width();
	// var menuButtonWidth = $('.top .menu').width();
	// var propWidth = Math.ceil(winWidth * 30 / 100);
	// var width =  300;

	// if ((winWidth - menuButtonWidth) < width)
	// 	width = winWidth - menuButtonWidth;
	// else if (propWidth > width) 
	// 	width = propWidth;

	// $('#menu').addClass('expanded').css('width', width);
	// $('#page').css('margin-left', width);


	var top = $('.top').outerHeight(true);
	var search = $('.searchArea').outerHeight(true) == null ? 0 : $('.searchArea').outerHeight(true);
	
	// Verify screen width to define device type
	deviceType($(window).width() < 720);

	refreshDotDotDot();

	$('body').height($(window).height() - top);
	$('#wrapper').css('top', top + search);



	pullDownEl = document.getElementById('pullDown');
	pullDownOffset = pullDownEl.offsetHeight;
	pullUpEl = document.getElementById('pullUp');	
	pullUpOffset = pullUpEl.offsetHeight;

	scrollDetail = new iScroll('wrapperDetail');
	scroll = new iScroll('wrapper',
	{
		useTransition: true,
		topOffset: pullDownOffset,
		onRefresh: function () 
		{
			if (pullDownEl.className.match('loading')) 
			{
				pullDownEl.className = '';
				pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Puxe para baixo para atualizar...';
			}
			else if (pullUpEl.className.match('loading')) 
			{
				pullUpEl.className = '';
				pullUpEl.querySelector('.pullUpLabel').innerHTML = 'Puxe para cima para carregar mais...';
			}
		},
		onScrollMove: function () 
		{
			if (this.y > 5 && !pullDownEl.className.match('flip')) 
			{
				pullDownEl.className = 'flip';
				pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Solte para atualizar...';
				this.minScrollY = 0;
			} 
			else if (this.y < 5 && pullDownEl.className.match('flip')) 
			{
				pullDownEl.className = '';
				pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Puxe para baixo para atualizar...';
				this.minScrollY = -pullDownOffset;
			} 
			else if (this.y < (this.maxScrollY - 5) && !pullUpEl.className.match('flip')) 
			{
				pullUpEl.className = 'flip';
				pullUpEl.querySelector('.pullUpLabel').innerHTML = 'Solte para carregar mais...';
				this.maxScrollY = this.maxScrollY;
			} 
			else if (this.y > (this.maxScrollY + 5) && pullUpEl.className.match('flip')) 
			{
				pullUpEl.className = '';
				pullUpEl.querySelector('.pullUpLabel').innerHTML = 'Puxe para cima para carregar mais...';
				this.maxScrollY = pullUpOffset;
			}
		},
		onScrollEnd: function () 
		{
			if (pullDownEl.className.match('flip')) 
			{
				pullDownEl.className = 'loading';
				pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Carregando...';
				pullDownAction();	
			} 
			else if (pullUpEl.className.match('flip')) 
			{
				pullUpEl.className = 'loading';
				pullUpEl.querySelector('.pullUpLabel').innerHTML = 'Carregando...';
				pullUpAction();	
			}
		} 
	});

	scrollMenu = new iScroll('menu');
}

document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
//document.addEventListener('DOMContentLoaded', loaded, false);

// Define device type
function deviceType (smartphone)
{
	if (smartphone)
		$('body').addClass('smartphone');
	else 
		$('body').removeAttr('class');
}

// Update scrollers
function scrollerRefresh()
{
	scrollDetail.refresh();
	scroll.refresh();
	scrollMenu.refresh();
}

function openMenu()
{
	var winWidth = $(window).width();
	var menuButtonWidth = $('.top .menu').width();
	var propWidth = Math.ceil(winWidth * 30 / 100);
	var width =  300;

	if ((winWidth - menuButtonWidth) < width)
		width = winWidth - menuButtonWidth;
	else if (propWidth > width) 
		width = propWidth;

	$('#menu').addClass('expanded').css('width', width);
	$('#page').css('margin-left', width);
}

function closeMenu()
{
	$('#menu').removeClass('expanded').removeAttr('style');
	$('#page').removeAttr('style');
}

jQuery(function ($)
{
	
	var top = $('.top').outerHeight(true);
	var search = $('.searchArea').outerHeight(true) == null ? 0 : $('.searchArea').outerHeight(true);
	
	// Verify screen width to define device type
	deviceType($(window).width() < 720);

	refreshDotDotDot();

	$('body').height($(window).height() - top);
	$('#wrapper').css('top', top + search);

	// Update scrollbars in all screen resizes
	$(window).on('resize', function() 
	{
		var top = $('.top').outerHeight(true);
		var search = $('.searchArea').outerHeight(true) == null ? 0 : $('.searchArea').outerHeight(true);
		
		// Verify screen width to define device type
		deviceType($(window).width() < 720);

		$('body').height($(window).height() - top);
		$('#wrapper').css('top', top + search);
		

		$('body').height($(this).height() - top);
		$('#wrapper').css('top', top + search);

		scrollerRefresh();
		refreshDotDotDot();
	})

	// Open menu clicking on header icon
	$('.menu').on('click', function ()
	{
		if ($('#contextMenu').is(':visible'))
			$('#contextMenu').addClass('hidden');

		if ($('#menu').hasClass('expanded'))
			closeMenu();
		else
			openMenu();

		scrollerRefresh();
		
		$('body').height($(window).height() - top);
	});

	$('.contextMenu').on('click', function ()
	{
		if ($('#contextMenu').is(':visible'))
			$('#contextMenu').addClass('hidden');
		else
			$('#contextMenu').removeClass('hidden');

	});

	$('#page').touchwipe(
	{
		wipeLeft: function() 
		{
			closeMenu();
			scrollerRefresh();
		},
		wipeRight: function() 
		{
			openMenu();
			scrollerRefresh();
		},
		preventDefaultEvents: true
	});

});

function pullDownAction () 
{
	setTimeout(function () 
	{	
		var el, li, i;
		el =  $("#scrollerList");

		for (i=0; i<10; i++) 
		{
			var listItem = getNewListRow('Nova Linha ' + (++generatedCount),'Descrição da linha ' + (generatedCount));
			listItem.prependTo(el);
			//el.insertBefore(listItem, el.childNodes[0]);
		}
		
		scroll.refresh();
	}, 1000);	
}

function pullUpAction () 
{
	setTimeout(function ()  // <-- Simulate network congestion, remove setTimeout from production!
	{	
		var el, li, i;
		el =  $("#scrollerList");

		for (i=0; i<10; i++) 
		{

			var listItem = getNewListRow('Nova Linha ' + (++generatedCount),'Descrição da linha ' + (generatedCount));
			listItem.appendTo(el);
			
		}
		
		scroll.refresh();		
	}, 1000);	// <-- Simulate network congestion, remove setTimeout from production!
}

function getNewListRow(title,description) 
{
	var listItem = $("<li/>");
	var listItemLink = $("<a/>").attr("href","#").appendTo(listItem);
	var listItemTitle = $("<h3>").html(title).appendTo(listItemLink);
	var listItemDescription = $("<span>").html(description).appendTo(listItemLink);

	return listItem;
}

function refreshDotDotDot() {
	$(".ellipsis20").dotdotdot({
		ellipsis	: '... ',
		wrap		: 'word',
		height		: '20',
		tolerance	: 0,
	});
	$(".ellipsis14").dotdotdot({
		ellipsis	: '... ',
		wrap		: 'word',
		height		: '14',
		tolerance	: 0,
	});
	$(".ellipsis50").dotdotdot({
		ellipsis	: '... ',
		wrap		: 'word',
		height		: '50',
		tolerance	: 0,
	});
	$(".ellipsis").dotdotdot({
		ellipsis	: '... ',
		wrap		: 'word',
		height		: '20',
		tolerance	: 0,
	});
}