---
layout: single
title: "Blog"
permalink: /blog/
author_profile: true
toc: true
toc_label: "Contents"
---

## Blog

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

## 中文翻译综述

Here I put some reviews paper which were translated to Chinese by GPT-5.6-sol. Hope these can help you! :)

这里我放了一些我用 GPT-5.6-sol 模型翻译的综述论文，希望这些能帮到你！：）

| Title | arXiv URL | Translation |
| --- | --- | --- |
| Large-Scale Galaxy Bias | [1611.09787](https://arxiv.org/abs/1611.09787) | [大尺度星系偏置](../assets/pdf/LargeScaleGalaxyBias.pdf) |
| Effective Field Theory in Cosmology | [2203.08232](https://arxiv.org/abs/2203.08232) | [宇宙学中的有效场论](../assets/pdf/EFTinCosmology.pdf) |