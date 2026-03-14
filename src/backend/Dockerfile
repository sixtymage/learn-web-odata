# ============================================================
# Dockerfile for the SAP CAP Backend
#
# Used by docker-compose.yml for Stage 5.
# Not needed for development — use 'cds watch' instead.
# ============================================================

FROM node:20-alpine

WORKDIR /app

# Copy package files first — Docker caches this layer.
# If only source files change, npm install is skipped on rebuild.
COPY package*.json ./

# Install production dependencies + PostgreSQL client for CAP
RUN npm install --omit=dev && \
    npm install @cap-js/postgres

# Copy the rest of the source
COPY . .

# Expose the CAP default port
EXPOSE 4004

# Start the CAP service in production mode
CMD ["npx", "cds-serve"]
