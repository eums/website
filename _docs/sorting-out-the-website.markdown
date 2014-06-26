website
=======

Getting it down to manageable size
----------------------------------

### things that shouldn't be in the actual website

* backups
* unused images (lots of separate croppings)
* unused theme (twentyfourteen)
* unused / unnecessary plugins
* files used only by committee (eg uploads/publicity)
* do newsletters need to go outside society? Can they be emailed?

### things that could be put into a separate static file hosting service

* images
* audio
* documents (pdfs and docs)

solution: move to google docs. base uri:
https://googledrive.com/host/0BxsJMhlYrb4QRTFGSHJTMTRuOEU/

Away from WordPress
-------------------

Storing posts in a database is not a good idea. Switching to jekyll-style posts would:

* Make them easier to edit
* Make it easy to find which assets are used where (in order to remove unused ones)
* Mitigate the huge security risk of PHP
* Reduce risk of losing them (they'd be on GitHub)

Redesign
--------

### What content does the site have?

* Upcoming events
* Upcoming concerts
* Past concerts
* Info about society:
    * ensembles
    * music library
    * committee
    * hockey
    * tour
* community
* sponsorship
* tweets
* last.fm
* alumni signup

### can we categorise users and their needs?

* potential members want to:
    * learn about the society to decide whether to join
    * get in contact (potensh FB, Twitter, mailing list)
    * learn about ILW workshops
    * find out how to get to rehearsals
* potential concert goers want to:
    * view potential concerts in order to see them
    * learn about previous concerts and/or assess the quality of the society
      in order to decide whether or not to go
    * find how to get to concerts
* other musical organisations - other student societies? charities? schools?
  musical groups? want to:
    * rent music from the music library
    * learn about joint hosting an event with us
* potential sponsors want to:
    * evaluate the quality of the society and the potential value of sponsoring
* alumni want to:
    * get added to the database (do they really?)
* press want to:
    * find out about the society
    * get in touch with committee

### things that need looking at

* Accessibility
* T&C
* Privacy
* carousels! http://conversionxl.com/dont-use-automatic-image-sliders-or-carousels-ignore-the-fad
* facebook / twitter at the end of every page
* EUMS sounds like a large coporation, not a student society, in places
    * related: do we really need to advertise our linkedin group?
* community / education is spread over 3 pages
* drake: out of date
* concerts: posts tagged incorrectly
* eums gold / support/individuals have overlapping content
* all the css (http://zmoazeni.github.io/csscss/)

### pages that seem unnecessary

* Press
* Useful Links
* Sitemap (the human one)

### things that I need to implement during migration

* events calendar (Jekyll collections / data?)
* form: needs JS to put form data into an email
* comments: disqus? fuck that, we don't need comments
* SEO! http://kadavy.net/blog/posts/everything-you-already-know-about-seo/
    * 301 (permanent) redirects
    * CSS image replacement https://github.com/h5bp/html5-boilerplate/blob/v4.3.0/css/main.css
    * dmoz.org
* Migrate from last.fm?
* Keep eums.eusa.ed.ac.uk running with just .htaccess files in order to:
    * redirect everything to eums.org.uk
    * Also redirect bad URLs to good ones
* Robots.txt
* Google
    http://www.google.com/submityourcontent/website-owner/
    https://www.google.com/webmasters/tools/
    https://support.google.com/webmasters/answer/6033085
* wtf is up with the upcoming events at https://www.google.com/?q=edinburgh%20university%20music&gws_rd=ssl#q=edinburgh+university+music+society&stick=H4sIAAAAAAAAAGOovnz8BQMDwzcOlkeMHxi5BV7-uCcs9Yxx0pqT1xjvM3JxBWfkl7vmlWSWVApdYORigzIFuPikuPRz9Q3SS8qMzY00GKTWMgrJc8nqJ-fn5KQml2Tm5-kn5yQWF2cmJ-bEJxaVZBaXFAvJckkjK8gtRZU24TJCls7Oyy_PSU1JT40vSMxLzSnWTy1LzSsp1k9JLdMvSC1Kyy_KTS0qFjLlMiZGV0FRfgqSNiUWDgYBZp5Fyp-6fXPmNKy-WqvcrPhwzzf23_EAlqDwqRMBAAA 
* Post excerpts??
* Good markup http://gsnedders.html5.org/outliner/
* Accessibility:
    * http://www.w3.org/TR/wai-aria/states_and_properties
    * http://wave.webaim.org/
* SPDY if self-hosting
* RSS feed
* Sitemap.xml (automated, preferably)

### Posts

* Categories that aren't really pulling their weight:
    * EUMS Online
    * EUMS In Depth
    * Uncategorised
    * Society
* Upcoming concerts should be Concerts
* Delete all non-Jekyll front matter apart from wordpress ID and excerpt

### Benefits

#### Admin

* Move to Jekyll which is much easier to administrate
* GitHub hosting which takes care of deployment for you
* Backed up on GitHub which is very unlikely to go down
* Google drive for large files; again, much easier to manage

#### User experience

* Redesign website to make it easier to find what you're looking for
* Mobile-friendly
* Use the nice domain name eums.org.uk rather than eums.eusa.ed.ac.uk
* Nicer URLs as well
* Improve accessibility for dyslexic or partially-sighted users - for example,
  compare zooming in on old/new websites
* Speed boosts from:
    * Using a static site instead of WordPress
    * Moving to high-quality GitHub hosting from unreliable, slow EUSA hosting
    * Removing swathes of unnecessary JavaScript
    * Removing swathes of inline styles
    * eg - previously, without caching, home page required 68 separate HTTP
      requests, is in total 2.1MB, and took around 18 seconds to load.

#### Google-fu

* Fix Googlebot indexing issues (this should improve search rankings)
* Nicer URLs (should also improve search rankings)
* Improve HTML wrt SEO
* Google ranks based on page speed

### Things that are no longer possible

* Password protected files. Google Drive is better for this anyway - as a user
  without the password, it's very annoying to follow a link to find that it
  needs a password you don't have. Better to use the mailing list or Facebook
  for distribution and not advertise its existence anywhere else.
