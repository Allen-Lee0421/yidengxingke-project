# 使用官方 Node.js 20 映像作為基礎
FROM node:20

# 設定工作目錄
WORKDIR /app

# 複製所有專案檔案到容器中
COPY . .

# 安裝依賴
RUN npm install

# 開放容器的 3000 埠口
EXPOSE 3000

# 啟動應用程式
CMD ["npm", "start"]

FROM node:20
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3000
CMD ["npm", "start"]