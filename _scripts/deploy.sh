
[ -f "_config.yml" ] && \
    jekyll build && \
    cd _site && \
    scp -r * buzzard.garrood.me:/home/harry/web/eums-staging/
