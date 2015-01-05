# Style Guide

## Large files

Anything over 1MB should go into Google Drive. Anything in the "public" folder
is visible to the whole internet, so be careful what you put there!

When uploading a newsletter, add it to /newsletters/ as well as making a post.

## HTML

### Learning resources

[GitHub's HTML style guide][] (this is required reading),  [MDN][],
[html5doctor][], and [A List Apart][] are recommended. **Don't** use
w3schools.com&mdash;despite the fact that they often appear at the top of
Google search results, their content is often outdated, incorrect, or
misleading. (I've purposefully avoided linking to their website)

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
  browser's ability to do this, then they're probably know how to open the link
  in a new window (if that's what they want). If they are not aware of it, or
  if they were expecting the link to open in the same window, it will confuse
  or annoy them.
* If linking to a page on the same domain, prefer to use a relative URL; that
  is, one starting with `/`. This rule should not be broken unless you have a
  very good reason.
* Avoid **ALL** JavaScript fuckery on links. The `onclick` attribute on an
  `<a>` element is absolutely off limits.

## URLs

* Underscores should be avoided, **especially** for URLs that users might see
  (as opposed to, say, image or PDF URLs). Prefer dashes - they look nicer and
  they're what Google expects (equals better search results).
* Avoid redundant information. For example, prefer `/blog/2014/summer-concert`
  to `/blog/2014/summer-concert-14`
* Avoid `.html` at the end of HTML pages.

[GitHub's HTML style guide]: https://github.com/styleguide/templates
[MDN]: https://developer.mozilla.org/en-US/docs/Web/HTML
[html5doctor]: http://html5doctor.com/
[A List Apart]: http://alistapart.com/
