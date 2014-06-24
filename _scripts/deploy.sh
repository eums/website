
[ -f "_config.yml" ] && \
    jekyll build && \
    rsync -r _site/ buzzard.garrood.me:/home/harry/web/eums-staging
