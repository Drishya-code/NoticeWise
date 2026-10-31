FROM node:22-alpine
ENV HOST=0.0.0.0
ENV PORT=8080
WORKDIR /app
COPY server.js ./server.js
COPY static ./static
EXPOSE 8080
USER node
CMD ["node", "server.js"]
