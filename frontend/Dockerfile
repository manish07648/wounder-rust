# ------------------- Stage 1: Build Stage ------------------------------
FROM node:21 AS frontend-builder

WORKDIR /app

COPY package*.json ./

RUN npm install

# --- YE DO LINE ADD KARO ---
# Ye building ke time hi API ka address andar fix kar degi
ARG VITE_API_BASE_URL=http://192.168.49.2:31100
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY . .

# ------------------- Stage 2: Final Stage ------------------------------
FROM node:21-slim

WORKDIR /app

COPY --from=frontend-builder /app .

# Is line ki ab zaroorat nahi padegi agar code mein sahi variable use ho raha hai
# COPY .env.sample .env.local 

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
