import cloudinary from 'cloudinary';

// Should be singleton
export class Cloudinary{
    private static instance: Cloudinary;
    public cloudinary;
    /**
     * The Singleton's constructor should always be private to prevent direct
     * construction calls with the `new` operator.
     */
    private constructor(){
        this.cloudinary = cloudinary.v2;
    }

    /**
     * The static method that controls the access to the singleton instance.
     *
     * This implementation let you subclass the Singleton class while keeping
     * just one instance of each subclass around.
     */
    public static getInstance(): Cloudinary {
        if (!Cloudinary.instance) {
            Cloudinary.instance = new Cloudinary();
        }

        return Cloudinary.instance;
    }

    config(){
        this.cloudinary.config({
            cloud_name: process.env.CLOUDINARY_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
            secure: true,
        });
    }

    async uploadUsersProfile(file){
        // File name must be called photo. 
        const fileName = file.photo;
        return await this.cloudinary.uploader.upload(fileName, {
            folder: "tKart/Users",
            width: 150,
            crops: "scale",
        });
    }
}
