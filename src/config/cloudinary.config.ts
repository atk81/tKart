import cloudinary from 'cloudinary';

// Should be singleton
export class Cloudinary{
    private static instance: Cloudinary;
    private cloudinary;
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

    /**
     * Upload the image to cloudinary.
     * @param file File
     * @return err | result
     */
    public async uploadUsersProfile(file){
        // File name must be called photo.
        // A user will have single photo.
        // If photo is already exits for that user, then replace with this new photo.
        // !TODO: Need to handle replace photo.
        return await this.cloudinary.uploader.upload(file.photo.tempFilePath,
            { folder: "tKart/Users"}
        );
    }
}