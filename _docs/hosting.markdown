MONTHLY USAGE:
Assuming 1500 page views
* and 3MB average downloaded per page =
  * 4.5GB data out
* and 200 bytes per request * average 50 requests per page view =
  * 15MB data in

SSL: Namecheap: $9/yr = 5.43/yr

hosting options:

* S3 is out because SSL with a custom domain is $600/mo

* EC2:
  * with a t1.micro, 1 yr medium reserved = $7/mo = 50/yr (but might need ebs
    or something?)
  * with a t2.medium, 1 yr medium reserved = $20/mo = 144/yr

* Linode 1GB looks good; $10/mo = 72/yr. Possibly also S3 for assets if the
  website gets too big or large files are too slow.

* Google App Engine might be good. It's a Platform As A Service which
  is much simpler than having to maintain our own VPS. We would also need a
  Google Apps account, though.

  Cost: (minimum)
  * Google Apps with one account: $5/yr = 3.02/yr
  * GAE:
    * 28 free instance-hours per day = free
    * 1GB HTTPS traffic outbound free, that's plenty
    * 1GB HTTPS traffic inbound free, that's plenty
  * GCS: 5GB free, that's plenty
  * Looks like it might be a pain to set up.

* Harp.io looks good
  * it's a static site platform, so no configuration needed
  * CDN = fast
  * SSL too (but we still need to get the cert)
  * $25/mo = 187/yr. So it is a bit expensive.

* Heroku might work well, and be free. problems: it seems that it is designed
  for dynamic, not static, websites, and it winds down your application after
  periods of inactivity. WordPress on heroku could be a good bet though. Would
  need S3 and wp-readonly for static files

* Dreamhost
  * Unlimited storage
  * SSL $15/yr
  * Hosting $5.95/mo
  * Unique IP $59.95/yr
  * total: $146.4/yr = 88/yr
