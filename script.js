jq(function () {
    var $ = jq;
    /* コメントの投稿時 */
    $(document).on('keydown', 'textarea.ac-input', function (e) {
        if (e.ctrlKey && e.which == 13) {
            var form = $(this).closest('form');
            var target = $('input[name=ac_form_submit]');
            var form_parent = form.parent();
            var form_id     = form.attr('id').split('-');

            if ( !form_parent.hasClass('activity-comments') ) {
                var tmp_id = form_parent.attr('id').split('-');
                var comment_id = tmp_id[1];
            } else {
                var comment_id = form_id[2];
            }

            /* Hide any error messages */
            $( 'form#' + form.attr('id') + ' div.error').hide();
            target.addClass('loading').prop('disabled', true);

            var ajaxdata = {
                action: 'new_activity_comment',
                'cookie': bp_get_cookies(),
                '_wpnonce_new_activity_comment': $("input#_wpnonce_new_activity_comment").val(),
                'comment_id': comment_id,
                'form_id': form_id[2],
                'content': $('form#' + form.attr('id') + ' textarea').val()
            };

            // Akismet
            var ak_nonce = $('#_bp_as_nonce_' + comment_id).val();
            if ( ak_nonce ) {
                ajaxdata['_bp_as_nonce_' + comment_id] = ak_nonce;
            }

            $.post( ajaxurl, ajaxdata, function(response) {
                target.removeClass('loading');

                /* Check for errors and append if found. */
                if ( response[0] + response[1] == '-1' ) {
                    form.append( $( response.substr( 2, response.length ) ).hide().fadeIn( 200 ) );
                } else {
                    var activity_comments = form.parent();
                    form.fadeOut( 200, function() {
                        if ( 0 == activity_comments.children('ul').length ) {
                            if ( activity_comments.hasClass('activity-comments') ) {
                                activity_comments.prepend('<ul></ul>');
                            } else {
                                activity_comments.append('<ul></ul>');
                            }
                        }

                        /* Preceeding whitespace breaks output with $uery 1.9.0 */
                        var the_comment = $.trim( response );

                        activity_comments.children('ul').append( $( the_comment ).hide().fadeIn( 200 ) );
                        form.children('textarea').val('');
                        activity_comments.parent().addClass('has-comments');
                    } );

                    $( 'form#' + form.attr('id') + ' textarea').val('');

                    /* Increase the "Reply (X)" button count */
                    $('li#activity-' + form_id[2] + ' a.acomment-reply span').html( Number( $('li#activity-' + form_id[2] + ' a.acomment-reply span').html() ) + 1 );

                    // Increment the 'Show all x comments' string, if present
                    var show_all_a = activity_comments.find('.show-all').find('a');
                    if ( show_all_a ) {
                        var new_count = $('li#activity-' + form_id[2] + ' a.acomment-reply span').html();
                        show_all_a.html( BP_DTheme.show_x_comments.replace( '%d', new_count ) );
                    }
                }

                $(target).prop("disabled", false);
            });
        }
    });

    /* タイムライン&コメントの編集時 */
    $(document).on('keydown', 'textarea[name=activity_content]', function (e) {
        if (e.ctrlKey && e.which == 13) {
            buddypress_edit_activity_initiate($(this).closest('li').find('.action-save')[0]);
        }
    });

    /* タイムラインの投稿時 */
    $('#whats-new').on('keydown', function (e) {
        if (e.ctrlKey && e.which == 13) {
            /* New posts */
            var button = $('#aw-whats-new-submit');
            var form = button.closest("form#whats-new-form");

            form.children().each( function() {
                if ( $.nodeName(this, "textarea") || $.nodeName(this, "input") )
                    $(this).prop( 'disabled', true );
            });

            /* Remove any errors */
            $('div.error').remove();
            button.addClass('loading');
            button.prop('disabled', true);
            form.addClass("submitted");

            /* Default POST values */
            var object = '';
            var item_id = $("#whats-new-post-in").val();
            var content = $("textarea#whats-new").val();

            /* Set object for non-profile posts */
            if ( item_id > 0 ) {
                object = $("#whats-new-post-object").val();
            }

            $.post( ajaxurl, {
                action: 'post_update',
                'cookie': bp_get_cookies(),
                '_wpnonce_post_update': $("input#_wpnonce_post_update").val(),
                'content': content,
                'object': object,
                'item_id': item_id,
                '_bp_as_nonce': $('#_bp_as_nonce').val() || ''
            },
            function(response) {

                form.children().each( function() {
                    if ( $.nodeName(this, "textarea") || $.nodeName(this, "input") ) {
                        $(this).prop( 'disabled', false );
                    }
                });

                /* Check for errors and append if found. */
                if ( response[0] + response[1] == '-1' ) {
                    form.prepend( response.substr( 2, response.length ) );
                    $( 'form#' + form.attr('id') + ' div.error').hide().fadeIn( 200 );
                    B
                } else {
                    if ( 0 == $("ul.activity-list").length ) {
                        $("div.error").slideUp(100).remove();
                        $("div#message").slideUp(100).remove();
                        $("div.activity").append( '<ul id="activity-stream" class="activity-list item-list">' );
                    }

                    $("ul#activity-stream").prepend(response);
                    $("ul#activity-stream li:first").addClass('new-update just-posted');

                    if ( 0 != $("#latest-update").length ) {
                        var l = $("ul#activity-stream li.new-update .activity-content .activity-inner p").html();
                        var v = $("ul#activity-stream li.new-update .activity-content .activity-header p a.view").attr('href');

                        var ltext = $("ul#activity-stream li.new-update .activity-content .activity-inner p").text();

                        var u = '';
                        if ( ltext != '' )
                            u = l + ' ';

                        u += '<a href="' + v + '" rel="nofollow">' + BP_DTheme.view + '</a>';

                        $("#latest-update").slideUp(300,function(){
                            $("#latest-update").html( u );
                            $("#latest-update").slideDown(300);
                        });
                    }

                    $("li.new-update").hide().slideDown( 300 );
                    $("li.new-update").removeClass( 'new-update' );
                    $("textarea#whats-new").val('');
                }

                $("#whats-new-options").animate({
                    height:'0px'
                });
                $("form#whats-new-form textarea").animate({
                    height:'20px'
                });
                $("#aw-whats-new-submit").prop("disabled", true).removeClass('loading');
            });
        }
    });

    /* 記事のコメント時 */
    $('#comment').on('keydown', function (e) {
        if (e.ctrlKey && e.which == 13) {
            /* this.submitが<input name="submit" ... >になっているためprototypeから関数を取ってくる */
            HTMLFormElement.prototype.submit.apply($(this).closest('form')[0], null);
        }
    });





    /* タイムラインのテキスト入力欄の自動サイズ変更 */
    function ajustmentTextarea(jqElem) {
        var LineHeight = Number(jqElem.css('line-height').split('px')[0]);
        var text = jqElem.val();
        var line = text.split('\n').length;
        jqElem.css('height', line * LineHeight + 2);
    }

    function autoAjustmentTextarea(selector) {
        var jqElem = $(selector);
        if (jqElem.length > 0) {
            /* デフォルトの挙動を無効に */
            var events = jqElem.data('events');
            if (events !== undefined) {
                if (events.focus !== undefined) {
                    /* 実行順序の関係でsetTimeout 0 をしている */
                    setTimeout(function () {
                        jqElem.off('focus');
                    }, 0);
                }
                if (events.focus !== undefined) {
                    jqElem.off('blur', jqElem.data('events').blur[0].handler);
                }
            }

            var f = function () { ajustmentTextarea(jqElem); };
            jqElem.on('input', f);
            jqElem.on('focus', f);
        }
    }

    autoAjustmentTextarea('#whats-new');
    autoAjustmentTextarea('textarea[name=activity_content]');
});

