<?php
// 投稿についたコメントで、投稿者本人以外のコメントは編集不可にする
add_action( 'pre_get_comments', 'my_pre_get_comments' );
function my_pre_get_comments( $query ) {
    if ( is_admin() && ! current_user_can( 'administrator' ) && 'edit-comments.php' == $GLOBALS['pagenow'] ) {
        $query->query_vars['user_id'] = get_current_user_id();
    }
}
add_filter( 'user_has_cap', 'my_user_has_cap', 10, 3 );
function my_user_has_cap( $allcaps, $caps, $args ) {
    if ( 'edit_comment' == $args[0] && get_current_user_id() == $args[1] && !is_super_admin()) {
        foreach ( $caps as $cap ) {
            unset($allcaps[$cap]);
        }
    }
    return $allcaps;
}

// サイドバーのグループ一覧を自分の所属するグループのみにする
function my_bp_group_widget_user_id() {
    return get_current_user_id();
}
add_filter('bp_group_widget_user_id', 'my_bp_group_widget_user_id');

// 記事のコメントなどに使えるHTMLタグを変更
function bac_allowed_html_tags_in_comments() {
    define('CUSTOM_TAGS', true);
    global $allowedtags;

    $allowedtags = array(
        'a' => [
            'href' => [],
            'target' => [],
        ],
        'marquee' => [
            'behavior' => [],
            'direction' => [],
            'loop' => [],
            'scrolldelay' => [],
            'scrollamount' => [],
            'bgcolor' => [],
        ]
    );
}
add_action('init', 'bac_allowed_html_tags_in_comments', 10);

// プロフィール欄の各項目が自動的にリンクになるのを無効化
remove_filter( 'bp_get_the_profile_field_value', 'xprofile_filter_link_profile_data', 9, 2);

// タイムラインの投稿をもっと短くする
function shorter_activity_entry($text) {
    if (bp_get_activity_type() == 'new_blog_post') {
        $striped_text = strip_tags($text);
        if (mb_strlen($striped_text) > 100) {
            $striped_text = mb_substr($striped_text, 0, 100);
            $striped_text .= '...';
        }
        return $striped_text;
    }
    return $text;
}
add_filter('bp_get_activity_content_body', 'shorter_activity_entry', 20);

// ブログ記事へのコメントをタイムラインに通知する
function bpfr_stream( $qs, $object ) {
    if ( 'activity' != $object ) {
        return $qs;
    }

    $qs = wp_parse_args( $qs, array() );

    $qs['display_comments'] = 'stream';

    return $qs;
}
add_filter('bp_ajax_querystring', 'bpfr_stream', 20, 2);

// グループへの投稿の場合はグループメンバーのみに見えるようにする 
add_filter('bp_groups_activity_visibility_levels', 'set_group_default_activity_privacy_level', 10, 1);
function set_group_default_activity_privacy_level($visibility_levels) {
    $visibility_levels['public']['default'] = false;
    $visibility_levels['grouponly']['default'] = true;
    return $visibility_levels;
}

/* TL投稿<img>タグを許可する */
function whitelist_tags_in_activity($allowedtags) {
    $allowedtags['img']['target'] = array();    
    return $allowedtags;
}
add_filter('bp_activity_allowed_tags', 'whitelist_tags_in_activity');

