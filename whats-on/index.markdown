---
layout: page
title: "What's on"
---

{% for post in site.posts %}
{% if post.tags contains 'Concerts' and post.is_upcoming %}
### {{ post.title }}

{{ post.content }}
{% endif %}
{% endfor %}
