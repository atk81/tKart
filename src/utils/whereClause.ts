import {Query, Document} from "mongoose";
import { logger } from "../logger";

export default class WhereClause<T>{
    public base: Query<any, Document<T>>;
    public bigQuery: {
        search?: string;
        page?: number;
        limit?: number;
        [key: string]: unknown;
    }

    constructor(base: Query<any, Document<T>>, bigQuery){
        this.base = base;
        this.bigQuery = bigQuery;
    }

    public search(){
        const search = this.bigQuery.search ? {
            name: {
                $regex: this.bigQuery.search,
                $options: 'i',
            }
        }
        : {};
        this.base.find({...search});
        return this;
    }

    public filter(){
        const copyQuery = {...this.bigQuery};
        delete copyQuery['page'];
        delete copyQuery['search'];
        delete copyQuery['limit'];

        // Convert copyQuery to JSon
        logger.info(copyQuery);
        if(copyQuery){
            let query = JSON.stringify(copyQuery);
            query = query.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
            this.base = this.base.find(JSON.parse(query));
        }
        return this;
    }

    public pager(resultPerPage){
        let currentPage = 1;
        if(this.bigQuery.page){
            currentPage = this.bigQuery.page;
        }
        const skip = (currentPage - 1) * resultPerPage;
        this.base = this.base.find().skip(skip).limit(resultPerPage);
        return this;
    }
}
