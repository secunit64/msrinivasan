---
title: Publications
---

<p class="eyebrow">Research record</p>

# Publications

<p class="lede">Selected work in generative AI, scientific visualization, computer graphics, and high-performance computing.</p>

For the broader publication record, visit [Google Scholar](https://scholar.google.com/citations?user=GxzYUjQAAAAJ).

<!-- publications -->

```js
import {
  initializePublicationFilter,
  filterPublications,
} from "./components/publication-filter.js";
const topicSelect = initializePublicationFilter();
const topic = Generators.input(topicSelect);
```

```js
{
  filterPublications(topic);
}
```
