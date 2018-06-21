npm run build
aws s3 sync dist/ s3://imaginerio.axismaps.com
aws cloudfront create-invalidation --distribution-id EXJ4VM8AU5FRR --paths /\*