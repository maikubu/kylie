$(function() {
    
    
    
    
    
    
    
    
    
    
    //____________CART______

    var d = document,
        itemBox = d.querySelectorAll('.item_box'), // блок каждого товара
        totalAmount = d.getElementById('total_amount'),
        cartCont = d.getElementById('cart_content'),
        cartEvent = d.getElementById('cart_event'), // блок вывода данных корзины
        totalData = getTotalData() || {items:0, amount:0};

    if (totalData['items'] > 0) {
        cartEvent.innerHTML = '(' + totalData['items'] + ')';
    }
    
// Функция кроссбраузерная установка обработчика событий
    function addEvent(elem, type, handler){
        if(elem.addEventListener){
            elem.addEventListener(type, handler, false);
        } else {
            elem.attachEvent('on'+type, function(){ handler.call( elem ); });
        }
        return false;
    }
// Получаем данные из LocalStorage
    function getCartData(){
        return JSON.parse(localStorage.getItem('cart'));
    }
    function getTotalData(){
        return JSON.parse(localStorage.getItem('total'));
    }
// Записываем данные в LocalStorage
    function setCartData(o){
        localStorage.setItem('cart', JSON.stringify(o));
        return false;
    }
    function setTotalData(o){
        localStorage.setItem('total', JSON.stringify(o));
        return false;
    }
// Удаляем товар из корзины
    function delFromCart(e){
        var itemId = this.getAttribute('data-id'),
            cartData = getCartData(),
            cartItems = Object.keys(cartData).length;
        
        if (cartItems > 1) {
            if (totalData['items'] > cartData[itemId][2]) {
                totalData['items'] -= cartData[itemId][2];
            } else {
                totalData['items'] = 0;
            }
            cartEvent.innerHTML = '(' + totalData['items'] + ')';
            setTotalData(totalData);
            delete cartData[itemId];
            setCartData(cartData);
        } else {
            localStorage.removeItem('cart');
            localStorage.removeItem('total');
            totalData = getTotalData() || {items:0, amount:0};
            cartEvent.innerHTML = '';
        }
        openCart();
    }    
// Добавляем товар в корзину
    function addToCart(e){
        this.disabled = true; // блокируем кнопку на время операции с корзиной
        var cartData = getCartData() || {}, // получаем данные корзины или создаём новый объект, если данных еще нет
            parentBox = this.parentNode, // родительский элемент кнопки &quot;Добавить в корзину&quot;
            itemId = this.getAttribute('data-id'), // ID товара
            itemTitle = parentBox.querySelector('.item_title').innerHTML, // название товара
            itemInnerData = parentBox.querySelector('.add_item').innerHTML, 
            itemInner = parentBox.querySelector('.add_item'), 
            itemPrice = parentBox.querySelector('.item_price').innerHTML, // стоимость товара
            itemQuantity = (parentBox.querySelector('.item_quantity') !== null) ? +parentBox.querySelector('.item_quantity').value : 1,
            itemImg = '<img class="cart-popup_table_item-img" src="' +this.getAttribute('data-img')+ '" alt="img">',
            itemDel = '<button class="del_item" data-id="' +itemId+ '"><i class="fa fa-times" aria-hidden="true"></i></button>';
        
        
        if(cartData.hasOwnProperty(itemId)){ // если такой товар уже в корзине, то добавляем +1 к его количеству
            cartData[itemId][2] += +itemQuantity;
        } else { // если товара в корзине еще нет, то добавляем в объект
            cartData[itemId] = [itemImg, itemTitle, itemQuantity, itemPrice, itemDel];
        }
        
        totalData['items'] += +itemQuantity;
        
        // Обновляем данные в LocalStorage
        if(!setCartData(cartData)){
            this.disabled = false; // разблокируем кнопку после обновления LS
            cartEvent.innerHTML = '(' + totalData['items'] + ')';
            setTotalData(totalData);
            
            this.innerHTML = 'added';
            setTimeout(function(){
                itemInner.innerHTML = itemInnerData
            }, 1000);
        }
        return false;
    }
// Устанавливаем обработчик события на каждую кнопку Добавить
    for(var i = 0; i < itemBox.length; i++){
        addEvent(itemBox[i].querySelector('.add_item'), 'click', addToCart);
    }
// Открываем корзину со списком добавленных товаров
    function openCart(e){

        var cartData = getCartData(), // вытаскиваем все данные корзины
            renderItems = '',
            cartItems = 0,
            cartAmount = 0;
        console.log(JSON.stringify(cartData));
        // если что-то в корзине уже есть, начинаем формировать данные для вывода
        if(cartData !== null){
            renderItems = '<table class="cart-popup_table">';
            for(var item in cartData){
                var counter = 0;
                cartAmount += cartData[item][2]*cartData[item][3];
                cartItems += +cartData[item][2];
                renderItems += '<tr class="cart-popup_table_row">';
                for(var i = 0; i < cartData[item].length; i++){
                    switch (counter) {
                        case 1:
                            renderItems += '<td class="cart-popup_table_item"><h3 class="cart-popup_table_item_name">' + cartData[item][i] + '</h3></td>';
                            break;
                        case 2:
                            renderItems += '<td class="cart-popup_table_item"><span class="cart-popup_table_item_quantity">' + cartData[item][i] + '<span class="light-w"> шт.</span></span></td>';
                            break;    
                        case 3:
                            renderItems += '<td class="cart-popup_table_item"><span class="cart-popup_table_item_price">' + cartData[item][i] + '<i class="fa fa-rub" aria-hidden="true"></i></span></td>';
                            break;
                        default:
                            renderItems += '<td class="cart-popup_table_item">' + cartData[item][i] + '</td>';
                    }
                    counter++;
                }
                renderItems += '</tr>';
            }
            
            renderItems += '<tr class="cart-popup_table_row total">' +
                '<td class="cart-popup_table_item" colspan="2"><h3 class="cart-popup_table_item_name total">Всего:</h3></td>' +
                '<td class="cart-popup_table_item"><span class="cart-popup_table_item_quantity total">' + cartItems + '<span class="light-w"> шт.</span></span></td>' +
                '<td class="cart-popup_table_item"><span class="cart-popup_table_item_price total">' + cartAmount + '<i class="fa fa-rub" aria-hidden="true"></i></span></td>' +
                '<td class="cart-popup_table_item"></td>' +
                '</tr></table>';
            cartCont.innerHTML = renderItems;
            totalData['amount'] = cartAmount;
            
            var delItems = cartCont.querySelectorAll('.del_item');
                        for(var j = 0; j < delItems.length; j++){
                addEvent(delItems[j], 'click', delFromCart);
            }
            
        } else {
            // если в корзине пусто, то сигнализируем об этом
            cartCont.innerHTML = '<h4 class="cart-popup_content_empty">В корзине пусто!</h4>';
        }
        return false;
    }
    
    /* Открыть корзину */
    addEvent(d.getElementById('view_cart'), 'click', openCart);
    /* Очистить корзину */
    addEvent(d.getElementById('clear_cart'), 'click', function(e){
        localStorage.removeItem('cart');
        localStorage.removeItem('total');
        totalData = getTotalData() || {items:0, amount:0};
        cartEvent.innerHTML = '';
        openCart();
    });

    $("a[href='#order_popup']").click(function () {
        if (totalData['items'] > 0) {
            var cartData = getCartData(),
                renderItems = '';

            totalAmount.innerHTML = totalData['amount'];
            $("input[name='total_amount']").val(totalData['amount']);

            if(cartData !== null){
                renderItems += 'Список товаров';
                var counter = 0;
                for(var item in cartData){
                    counter++;
                    renderItems += '<br>' + counter + ') ' + item + ' - ' + cartData[item][2] + ' шт. - ' + cartData[item][3] +' р.';
                }
            }

            $("input[name='total_items']").val(renderItems); 
        } else {
            $('#order-btn').prop('disabled', true);
            $('.empty').addClass('visible');
            setTimeout(function() {
                $('.empty').removeClass('visible');
                $('#order-btn').prop('disabled', false);
                $.magnificPopup.close();
            }, 6000);
        }
    });
    
    
    
    
    //________MOBILE-MENU

    $(".main_nav-toggle-menu").click(function() {
        $(this).toggleClass("on");
        $(".main_nav-list").slideToggle();
        return false;
    });
    
    
    
    
    
    
    //__________STICKY-ANYTHING________

    $('.main_nav').stickThis({
        top:            0,          // top position of sticky element, measured from 'ceiling'
        minscreenwidth: 0,          // element will not be sticky when viewport width smaller than this
        maxscreenwidth: 999999,     // element will not be sticky when viewport width larger than this 
        zindex:         5,          // z-index value of sticky element
        debugmode:      true,      // when true, errors will be logged to console
        pushup:         '.main_footer'          // another (unique) element on the page that will 'push up' the sticky element
    });

    
    //________MAGNIFIC-POPUP_______
    
    $('.popup-with-move-anim').magnificPopup({
        type: 'inline',

        fixedContentPos: false,
        fixedBgPos: true,

        overflowY: 'scroll',

        closeBtnInside: true,
        preloader: true,

        midClick: true,
        removalDelay: 0,
        mainClass: 'my-mfp-slide-bottom',
        callbacks: {
            beforeOpen: function() {
                
            },
            open: function() {
                // Will fire when this exact popup is opened
                // this - is Magnific Popup object
                $('.mfp-content').find('.card-popup_slider-prev, .card-popup_slider-next, .card-popup_slider-wrap, .card-popup_thumb_slider').addClass('active');
                $('.card-popup_slider-wrap.active').slick({
                    dots: false,
                    arrows: true,
                    infinite: true,
                    prevArrow: $('.card-popup_slider-prev.active'),
                    nextArrow: $('.card-popup_slider-next.active'),
                    speed: 800,
                    fade: false,
                    cssEase: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
                    asNavFor: '.card-popup_thumb_slider.active'
                });


                $('.card-popup_thumb_slider.active').slick({
                    dots: false,
                    arrows: false,
                    speed: 800,
                    slidesToShow: 2,
                    slidesToScroll: 1,
                    focusOnSelect: true,
                    asNavFor: '.card-popup_slider-wrap.active'
                });
            },
            beforeClose: function() {
                // Will fire when popup is closed
                $('.card-popup_slider-wrap.active').slick('unslick');
                $('.card-popup_thumb_slider.active').slick('unslick');
                $('.mfp-content').find('.card-popup_slider-prev, .card-popup_slider-next, .card-popup_slider-wrap, .card-popup_thumb_slider').removeClass('active');
            },
            Close: function () {
                
            }
        }
        
    });

    $('.cart_popup-with-move-anim').magnificPopup({
        type: 'inline',

        fixedContentPos: false,
        fixedBgPos: true,

        overflowY: 'scroll',

        closeBtnInside: true,
        preloader: true,

        midClick: true,
        removalDelay: 0,
        mainClass: 'my-mfp-slide-bottom'


    });

    $('.order_popup-with-move-anim').magnificPopup({
        type: 'inline',

        fixedContentPos: false,
        fixedBgPos: true,

        overflowY: 'scroll',

        closeBtnInside: true,
        preloader: true,

        midClick: true,
        removalDelay: 0,
        mainClass: 'my-mfp-slide-bottom'


    });
    
    //______EQUAL-HEIGHTS______

    $('.product').equalHeights();
    $('.advantage').equalHeights();
    
    
    
    //___SLICK-CAROUSEL__
    
    $('.main_slider-wrap').slick({
        dots: true,
        arrows: true,
        infinite: true,
        prevArrow: $('.main_slider-prev'),
        nextArrow: $('.main_slider-next'),
        speed: 500,
        autoplay: false,
        autoplaySpeed: 4000,
        fade: true,
        cssEase: 'cubic-bezier(.48,.01,1,1)',
        dotsClass: 'main_slider-dots'
        
    });
    
    
    
    
    //_________INPUT-NUMBER______

    jQuery('.quantity').each(function() {
        var spinner = jQuery(this),
            input = spinner.find('input[type="number"]'),
            btnUp = spinner.find('.quantity-up'),
            btnDown = spinner.find('.quantity-down'),
            min = input.attr('min'),
            max = input.attr('max');

        btnUp.click(function() {
            var oldValue = parseFloat(input.val());
            var newVal;
            if (oldValue >= max) {
                newVal = oldValue;
            } else {
                newVal = oldValue + 1;
            }
            spinner.find("input").val(newVal);
            spinner.find("input").trigger("change");
        });

        btnDown.click(function() {
            var oldValue = parseFloat(input.val());
            var newVal;
            if (oldValue <= min) {
                newVal = oldValue;
            } else {
                newVal = oldValue - 1;
            }
            spinner.find("input").val(newVal);
            spinner.find("input").trigger("change");
        });
    });


    //E-mail Ajax Send
    //Documentation & Example: https://github.com/agragregra/uniMail
    $("#order-form").submit(function() { //Change
        var th = $(this);
        $.ajax({
            type: "POST",
            url: "mail.php", //Change
            data: th.serialize()
        }).done(function() {
            $('.success').addClass('visible');
            setTimeout(function() {
                // Done Functions
                th.trigger("reset");
                $('.success').removeClass('visible');
                $.magnificPopup.close();
            }, 3000);
        });
        return false;
    });

    //Chrome Smooth Scroll
    try {
        $.browserSelector();
        if($("html").hasClass("chrome")) {
            $.smoothScroll();
        }
    } catch(err) {

    };

    $("img, a").on("dragstart", function(event) { event.preventDefault(); });
    

});
