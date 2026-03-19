Project Name: Assessment


🚀 Features

•	User authentication (JWT)

•	REST APIs

•	Prisma ORM integration

•	PostgreSQL database


🛠️ Tech Stack

•	Node.js

•	Express.js

•	Prisma ORM

•	Supabase PostgreSQL

📦 Installation

Clone the repository:

git clone https://github.com/naiyerazm/assessment.git

cd your-repo

Install dependencies:

npm install

⚙️ Environment Variables
Create a .env file in the root:

PORT=PORT

DATABASE_URL=Db Connection

JWT_SECRET=JWT Secrete

▶️ Run the project on local:

node index

🗄️ Database Setup (Prisma)

Generate Prisma client:

npx prisma generate

npx prisma db push

📡 API Endpoints

Method	Endpoint	Description

GET	/api/users	Get all users

POST	/api/users	Create user

📁 Project Structure

src/

 ├── routes/

 ├── controllers/

 ├── middleware/

 ├── prisma/

 └── app.js
 
🚀 Deployment
Deployed on Railway

