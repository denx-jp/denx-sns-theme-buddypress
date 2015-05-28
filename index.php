<?php get_header(); ?>

	<div id="content">
		<div class="padder">

		<?php do_action( 'bp_before_blog_home' ); ?>

		<?php do_action( 'template_notices' ); ?>

		<div class="page" id="blog-latest" role="main">

			<?php if ( have_posts() ) : ?>

				<?php bp_dtheme_content_nav( 'nav-above' ); ?>

				<?php while (have_posts()) : the_post(); ?>

					<?php do_action( 'bp_before_blog_post' ); ?>

					<div id="post-<?php the_ID(); ?>" <?php post_class(); ?>>

						<div class="author-box">
                            <a href="<?php echo bp_core_get_user_domain($post->post_author); ?>">
                            <?php echo get_avatar( get_the_author_meta( 'user_email' ), '40' ); ?>
                                </a>
						</div>

						<div class="post-content">
							<p class="posttitle">
                                <a href="<?php the_permalink(); ?>" rel="bookmark" title="<?php esc_attr_e( 'Permanent Link to', 'buddypress' ); ?> <?php the_title_attribute(); ?>"><?php $title = get_the_title(); echo empty($title) ? '(no title)' : $title; ?></a>
                                <span class="post-excerpt"><?php echo substr( strip_tags( get_the_excerpt() ),0,235) ?></span>
                            </p>
                            <p class="date"><a href="<?php the_permalink(); ?>"><?php printf( 'コメント (%d)', get_comments_number()); ?></a>&nbsp;<?php printf('%s %s', get_the_date(), get_the_time()) ?></p>

                            <?php
                            /*
							<p class="date"><?php printf( __( '%1$s <span>in %2$s</span>', 'buddypress' ), get_the_date(), get_the_category_list( ', ' ) ); ?></p>

							<div class="entry">
								<?php the_content( __( 'Read the rest of this entry &rarr;', 'buddypress' ) ); ?>
								<?php wp_link_pages( array( 'before' => '<div class="page-link"><p>' . __( 'Pages: ', 'buddypress' ), 'after' => '</p></div>', 'next_or_number' => 'number' ) ); ?>
							</div>

							<p class="postmetadata"><?php the_tags( '<span class="tags">' . __( 'Tags: ', 'buddypress' ), ', ', '</span>' ); ?> <span class="comments"><?php comments_popup_link( __( 'No Comments &#187;', 'buddypress' ), __( '1 Comment &#187;', 'buddypress' ), __( '% Comments &#187;', 'buddypress' ) ); ?></span></p>
                            */
                            ?>
						</div>

					</div>

					<?php do_action( 'bp_after_blog_post' ); ?>

				<?php endwhile; ?>

				<?php bp_dtheme_content_nav( 'nav-below' ); ?>

			<?php else : ?>

				<h2 class="center"><?php _e( 'Not Found', 'buddypress' ); ?></h2>
				<p class="center"><?php _e( 'Sorry, but you are looking for something that isn\'t here.', 'buddypress' ); ?></p>

				<?php get_search_form(); ?>

			<?php endif; ?>
		</div>

		<?php do_action( 'bp_after_blog_home' ); ?>

		</div><!-- .padder -->
	</div><!-- #content -->

	<?php get_sidebar(); ?>

<?php get_footer(); ?>
