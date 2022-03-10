FROM node:17.6.0-alpine as base

COPY ./package.json ./
COPY ./package-lock.json ./
COPY scripts/dev.sh ./scripts/dev.sh

RUN npm install && npm cache clean --force

# Copy source
COPY src ./src
COPY tsconfig.json ./tsconfig.json
COPY openAPI ./openAPI

RUN npm run build

# Start production image build
FROM gcr.io/distroless/nodejs:16

# Copy node modules and build directory
COPY --from=base ./node_modules ./node_modules
COPY --from=base /dist /dist

# Expose port 3000
EXPOSE 3000
CMD ["npm", "start"]
