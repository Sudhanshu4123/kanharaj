# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Set the production API URL during build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ARG NEXT_PUBLIC_MAIN_URL
ENV NEXT_PUBLIC_MAIN_URL=${NEXT_PUBLIC_MAIN_URL}

RUN npm run build

# Run stage — uses Next.js standalone output for smaller image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
EXPOSE 3001
ENV PORT=3001
CMD ["node", "server.js"]
