---
---

<img alt="Chorus and Symphony Orchestra at the performance of Verdi's Requiem in 2013" src="/assets/img/symphony-chorus-verdi-2013.jpg" class="bordered">

## Who are we?

The Edinburgh University Music Society is widely regarded as one of Scotland's leading student music organisations&mdash;not only in its standard of performance, but also in its involvement with the wider community through education projects and fundraising concerts.

The Society consists of three ensembles, altogether numbering around 300 people. We perform at least six times per year, in addition to running community projects and Innovative Learning Week events, and going on an annual tour.

<ul>
<li><a href="/get-involved/">Get involved</a></li>
<li><a href="/whats-on/">What's on</a></li>
</ul>

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
