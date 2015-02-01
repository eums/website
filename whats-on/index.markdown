---
layout: page
title: "What's on"
---

## What's on

<ul class="whats-on-events">
{% for event in site.data.events %}
<li>
  <h3>
    {% if event.url %}<a href="{{ event.url }}">{{ event.title }}</a>{% else %}{{ event.title }}{% endif %}, {% if event.date %}{{ event.date | date: "%a %-d %B" }}{% endif %}
  </h3>
</li>
{% endfor %}
</ul>

<hr>

We perform six main concerts a year, with a Winter concert series, a Spring
concert series and a Summer concert. Each year one of our concerts also
includes a joint collaboration between the Chorus and one of either Sinfonia or
Symphony Orchestra. Concerts usually take place in the same venues (see [where
we perform](/venues/)), and are easily accessible from the centre of Edinburgh.

Tickets can be bought on the door, but we sell tickets in advance online and at
rehearsals. Prices are very reasonable, and we offer further concessions to
students and under-16s. Further booking options are available for larger
groups. Our concerts always start at 7.30pm with doors usually opening at 7pm.

We know that sometimes there is a lot to think about when attending a classical
concert, especially if it is your first, so we have compiled a list of
[frequently asked questions](/concert-faqs/).
