# Style Guide

## HTML

### Learning resources

[GitHub's HTML style guide][],  [MDN][], [html5doctor][], and [A List Apart][]
are recommended. **Don't** use w3schools.com&mdash;despite the fact that they
often appear at the top of Google search results, their content is often
outdated, incorrect, or misleading. (I've purposefully avoided linking to their
website)

### Accessibility

Designing for accessibility is important. Not only does it mean that a wider
audience will be able to view our content, but also that you probably end up
with a better and more maintainable web page.

* Read [html5doctor][] to learn about how to write semantic markup; that is,
  what elements are appropriate in what contexts. Prefer elements with semantic
  meaning where appropriate. For example, use `<nav>` instead of `<div
  id="nav">`.
* Use `ARIA` attributes.

### Links

* Avoid links that open in a new window or tab. If the user is aware of their
  browser's ability to do this, then they're probably able to
* Avoid **ALL** JavaScript fuckery. The `onclick` attribute on an `<a>`
  element is absolutely off limits.

## URLs

* Underscores should be avoided, **especially** for URLs that users might see
  (as opposed to, say, image or PDF URLs).
* Avoid redundant information. For example, `/blog/2014/summer-concert-2014`
  is bad; a better alternative is `/blog/2014/summer-concert`
*

[GitHub's HTML style guide]: https://github.com/styleguide/templates
[MDN]: https://developer.mozilla.org/en-US/docs/Web/HTML
[html5doctor]: http://html5doctor.com/
[A List Apart]: http://alistapart.com/
