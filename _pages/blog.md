---
layout: single
title: "Blog"
permalink: /blog/
author_profile: true
---

This is my blog space. I can drop short notes, experiments, and longer posts here.

Some of them (especially experiences) are in Chinese, maybe you need translator. Most of the physics research notes are in English.

本页包含了一些中文内容，一些是我在中文社交媒体（Uphi. @知乎 和 @小红书）上发表过的内容，我也一同整合到了这里；大部分物理研究笔记是英文写的，请放心阅读.

<ul class="post-list">
{% for post in site.posts %}
  <li>
    <!-- <span class="post-meta">{{ post.date | date: "%Y-%m-%d" }}</span> -->
    <!-- <h3> -->
      <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
    <!-- </h2> -->
    <!-- {% if post.excerpt %}
      <p>{{ post.excerpt | strip_html | truncate: 180 }}</p>
    {% endif %} -->
  </li>
{% endfor %}
</ul>