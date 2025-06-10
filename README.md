# 📌 Modelify

---

## 🧠 Backstory

The project began as a collaboration between me and a local business that needed a simple 3D model viewer with AR capabilities to replace a system their partner was using, which was going out of business. That’s how the first prototype—**Lookie**—was born.

Lookie laid the foundation for what would eventually become this project. It shares much of the same core DNA in terms of the viewer component. However, **Modelify** takes it a step further—evolving Lookie into a full-stack SaaS application built with modern technologies.

Although the business ultimately chose not to acquire the prototype, the concept stuck with me. The project was put on hold—until I began exploring ideas for my thesis. That’s when I decided it was time to give Lookie the upgrade it truly deserved.

And here we are.

Disclaimer:

> I know the project isn't perfect, and the code isn’t the cleanest—but it’s an honest, wholehearted attempt at building my first real SaaS product. It represents a lot of learning, experimentation, and persistence.

---

## ✨ Features

- 🚧 Work in Progress!

---

## 🛠️ Technologies Used

- **Frontend:** Next.js 15, Tailwind CSS, TypeScript
- **Backend:** Node.js, Appwrite, Kinde Auth
- **Database:** Appwrite Database & Bucket
- **Other Tools:** GitHub Actions, Vercel (for the deployment)

---

## 🚀 How to Use This Project

1.  **Clone the repository**

    ```bash
    git clone https://github.com/mppapad/Modelify.git
    cd Modelify
    ```

2.  **Install dependencies**

    ```bash
    npm install
    ```

3.  **Configure environment variables**  
    Create a `.env` file with the necessary environment variables.

    ```bash
    KINDE_CLIENT_ID=
    KINDE_CLIENT_SECRET=
    KINDE_ISSUER_URL=
    KINDE_SITE_URL=
    KINDE_POST_LOGOUT_REDIRECT_URL=
    KINDE_POST_LOGIN_REDIRECT_URL=

    NEXT_PUBLIC_APPWRITE_ENDPOINT=
    NEXT_PUBLIC_APPWRITE_PROJECT_ID=
    NEXT_PUBLIC_APPWRITE_DATABASE_ID=
    NEXT_PUBLIC_APPWRITE_MODELS_COLLECTION_ID=
    NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID=
    APPWRITE_ANALYTICS_COLLECTION_ID=
    NEXT_PUBLIC_APPWRITE_BUCKET_ID=
    APPWRITE_API_KEY=
    ```

4.  **Run the project**

    ```bash
    npm run dev
    or
    npm run build
    ```

5.  **Open in browser**  
    Visit `http://localhost:3000`

---
## 💾 Database schema

- This is also a Work in Progress!

````bash
*insert Schema here* 
````
--- 

## 🔮 Future of the project

I would like to add these features sometime:

- Virtual Try-On (VTO)

  > Allowing users to visualize how 3D models (e.g. glasses, hats, or watches, jewelry) would look on them in real-time using augmented reality and face and hand tracking.

  > Unfortunately, this feature didn’t make it into the final build due to time constraints and the high complexity of the topic. I did explore a few technical approaches and prototyped some initial ideas, but they didn’t mature enough to be published or integrated into the main project.

  This remains a high-interest area for future development, especially as I continue to learn more about real-time face tracking, AR frameworks, and hand/Wrist Tracking.

---

## 📦 Libraries Used

- `Shadcn-ui` – For A LOT of front-end React components.
- `model-viewer` – For the base 3D viewer and AR functionality
- `Kinde auth SDK` – For the authentication of the project.
- `Appwrite SDK` – For auth, DB & Buckets

- And many more i can't think of right now!

---

## 🐞 Bugs & Vulnerabilities 

If you happen to find any bugs or vulnerabilities, I would kindly ask to open an issue with the template provided below.

````bash
*insert template here* 
````

