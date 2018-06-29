mkdir -p src/leaflet/dist
mkdir -p src/jquery/dist
mkdir -p src/underscore
mkdir -p src/d3-dispatch/build
mkdir -p src/hammerjs

cp node_modules/leaflet/dist/leaflet.css src/leaflet/dist/leaflet.css
cp node_modules/jquery/dist/jquery.min.js src/jquery/dist/jquery.min.js
cp node_modules/leaflet/dist/leaflet.js src/leaflet/dist/leaflet.js
cp node_modules/underscore/underscore-min.js src/underscore/underscore-min.js
cp node_modules/d3-dispatch/build/d3-dispatch.min.js src/d3-dispatch/build/d3-dispatch.min.js
cp node_modules/hammerjs/hammer.min.js src/hammerjs/hammer.min.js

aws s3 sync src s3://instituterice.axismaps.com
aws cloudfront create-invalidation --distribution-id E1TLG7RZUOW3J3 --paths /\*