npm run build
aws s3 sync dist/ s3://imaginerio.org
aws cloudfront create-invalidation --distribution-id EUA38HDTHA7D7 --paths /\*