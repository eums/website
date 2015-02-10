---
image_fader: true
---

<div class="image-fader-container clearfix">
<div id="image-fader" class="image-fader" style="position: relative;">
<img src="/assets/img/fader/verdi-chorus.jpg" style="position: absolute; top: 0; left: 0; z-index: 1" onload="this._succeeded = true">
</div>
<img src="/assets/img/fader/placeholder.png">
</div>

## Who are we?

The Edinburgh University Music Society is widely regarded as one of Scotland's leading student music organisations&mdash;not only in its standard of performance, but also in its involvement with the wider community through education projects and fundraising concerts.

The Society consists of three ensembles, altogether numbering around 300 people. We perform at least six times per year, in addition to running community projects and Innovative Learning Week events, and going on an annual tour.

<div class="image-link-tiles tiles-3 clearfix">
  <a class="tile tile-get-involved" href="/get-involved/" title="Image &copy; Louise Spence Photography (louiseanna.co.uk), 2014">
    <div class="caption">
      <h3>Get involved</h3>
      <p>Find out about what we get up to, and how you can join</p>
    </div>
  </a>

  <a class="tile tile-whats-on" href="/whats-on/" title="Image &copy; Louise Spence Photography (louiseanna.co.uk), 2014">
    <div class="caption">
      <h3>What's on</h3>
      <p>Get details of our upcoming concerts and other events</p>
    </div>
  </a>

  <a class="tile tile-community" href="/community/" title="Image &copy; Alastair Temple (facebook.com/atempleartist), 2012">
    <div class="caption">
      <h3>Community</h3>
      <p>Read about our charity work and education projects</p>
    </div>
  </a>
</div>

<div class="clearfix quotes">
<blockquote class="quote-left">
<p>
<strong>
&ldquo;I had forgotten how much I adore Schubert’s Unfinished Symphony &hellip; it is such an emotional work and they carried it off well, the conductor once again bringing out the best from everyone&rdquo;
</strong>
<cite>&mdash; <a href="http://www.belfastcathedral.org/news/item/722/music-festival-opens-with-the-edinburgh-university-music-society/">
The Very Reverend John Mann, St Anne's Cathedral
</a>
</cite>
</p>
</blockquote>

<blockquote class="quote-right">
<p>
<strong>
&ldquo;Am I allowed to say brilliant? The EUMS was stunningly good &hellip; I’m not sure that I have ever heard a choir cut and start as if the power had gone off and then on again&rdquo;
</strong>
<cite>&mdash; <a href="http://playpitspark.wordpress.com/2010/11/20/the-armed-man/">Richard Whittle</a>
</cite>
</p>
</blockquote>
</div>

<hr>

<h2>From the <a href="/blog/">blog</a></h2>

{% for post in site.posts offset:0 limit:3 %}
<div class="recent-post">
  <h3><a href="{{ post.url }}">{{ post.title }}</a></h3>
  <p>{{ post.content | strip_html | truncatewords: 50 }}</p>
</div>
{% endfor %}

<a href="/blog/">Older posts &raquo;</a>
