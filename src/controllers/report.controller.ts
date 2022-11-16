import { Request,Response,NextFunction } from "express";
import { mentor } from "../models/mentor.model";
import { organization } from "../models/organization.model";
import TranslationService from "../services/translation.service";
import dispatcher from "../utils/dispatch.util";
import db from "../utils/dbconnection.util"
import { courseModuleSchema, courseModuleUpdateSchema } from "../validations/courseModule.validationa";
import { translationSchema, translationUpdateSchema } from "../validations/translation.validations";
import ValidationsHolder from "../validations/validationHolder";
import { quiz_survey_response } from '../models/quiz_survey_response.model';
import BaseController from "./base.controller";
import { constents } from "../configs/constents.config";
import { mentor_course_topic } from "../models/mentor_course_topic.model";
import { internal, notFound } from "boom";
import { speeches } from "../configs/speeches.config";
import ReportService from "../services/report.service";
import { Op, QueryTypes } from 'sequelize';
import { user } from "../models/user.model";

export default class ReportController extends BaseController {

    model = "mentor"; ///giving any name because this shouldnt be used in any apis in this controller

    protected initializePath(): void {
        this.path = '/reports';
    }
    protected initializeValidations(): void {
        // this.validations =  new ValidationsHolder(translationSchema,translationUpdateSchema);
    }
    protected initializeRoutes(): void {
        //example route to add 
        this.router.get(`${this.path}/allMentorReports`, this.getAllMentorReports.bind(this));
        this.router.get(`${this.path}/regList`, this.getMentorRegList.bind(this));
        this.router.get(this.path + "/preSurvey", this.mentorPreSurvey.bind(this));
        this.router.get(this.path + "/courseComplete", this.courseComplete.bind(this));
        this.router.get(this.path + "/courseInComplete", this.courseInComplete.bind(this));
        this.router.get(this.path + "/notRegistered", this.notRegistered.bind(this));
        // super.initializeRoutes();
    }

    protected async getMentorRegList(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { quiz_survey_id } = req.params
            const { page, size, status } = req.query;
            let condition = {}
            // condition = status ? { status: { [Op.like]: `%${status}%` } } : null;
            const { limit, offset } = this.getPagination(page, size);
            const modelClass = await this.loadModel(this.model).catch(error => {
                next(error)
            });
            const paramStatus: any = req.query.status;
            let whereClauseStatusPart: any = {};
            let whereClauseStatusPartLiteral = "1=1";
            let addWhereClauseStatusPart = false
            if (paramStatus && (paramStatus in constents.common_status_flags.list)) {
                whereClauseStatusPart = { "status": paramStatus }
                whereClauseStatusPartLiteral = `status = "${paramStatus}"`
                addWhereClauseStatusPart = true;
            }
            const mentorsResult = await mentor.findAll({
                attributes: [
                    "full_name",
                    "mobile",
                    "created_by",
                    "created_at",
                    "updated_at",
                    "updated_by"
                ],
                raw: true,
                where: {
                    [Op.and]: [
                        whereClauseStatusPart,
                        condition
                    ]
                },
                include: [
                    {
                        model: organization,
                        attributes: [
                            "organization_code",
                            "district",
                            "organization_name"
                        ]
                    },
                    {
                        model: user,
                        attributes: [
                            "username",
                            "user_id"
                        ]
                    }
                ],
                limit, offset
            });
            if (!mentorsResult) {
                throw notFound(speeches.DATA_NOT_FOUND)
            }
            if (mentorsResult instanceof Error) {
                throw mentorsResult
            }
            res.status(200).send(dispatcher(res, mentorsResult, "success"))
        } catch (err) {
            next(err)
        }
    }
    protected async mentorPreSurvey(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { quiz_survey_id } = req.params
            const { page, size, role } = req.query;
            let condition = role ? role : 'MENTOR';
            // let condition = role ? { role: { [Op.eq]: role } } : null;
            const { limit, offset } = this.getPagination(page, size);
            const modelClass = await this.loadModel(this.model).catch(error => {
                next(error)
            });
            const paramStatus: any = req.query.status;
            let whereClauseStatusPart: any = {};
            let whereClauseStatusPartLiteral = "1=1";
            let addWhereClauseStatusPart = false
            if (paramStatus && (paramStatus in constents.common_status_flags.list)) {
                whereClauseStatusPart = { "status": paramStatus }
                whereClauseStatusPartLiteral = `status = "${paramStatus}"`
                addWhereClauseStatusPart = true;
            }
            const mentorsResult = await quiz_survey_response.findAll({
                attributes: [
                    "quiz_response_id",
                    "updated_at"
                ],
                raw: true,
                where: {
                    [Op.and]: [
                        whereClauseStatusPart
                    ]
                },
                include: [
                    {
                        model: user,
                        attributes: [
                            "full_name",
                            "created_at",
                            "updated_at"
                        ],
                        where: { role: condition }
                    }
                ],
                limit, offset
            });
            if (!mentorsResult) {
                throw notFound(speeches.DATA_NOT_FOUND)
            }
            if (mentorsResult instanceof Error) {
                throw mentorsResult
            }
            res.status(200).send(dispatcher(res, mentorsResult, "success"))
        } catch (err) {
            next(err)
        }
    }
    protected async courseComplete(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { quiz_survey_id } = req.params
            const { page, size, role } = req.query;
            let condition = role ? { role: { [Op.eq]: role } } : null;
            const { limit, offset } = this.getPagination(page, size);
            const modelClass = await this.loadModel(this.model).catch(error => {
                next(error)
            });
            const paramStatus: any = req.query.status;
            let whereClauseStatusPart: any = {};
            let whereClauseStatusPartLiteral = "1=1";
            let addWhereClauseStatusPart = false
            if (paramStatus && (paramStatus in constents.common_status_flags.list)) {
                whereClauseStatusPart = { "status": paramStatus }
                whereClauseStatusPartLiteral = `status = "${paramStatus}"`
                addWhereClauseStatusPart = true;
            }
            const mentorsResult = await db.query("SELECT mentors.organization_code, mentors.district, mentors.full_name,(SELECT COUNT(mentor_topic_progress_id)FROM mentor_topic_progress AS mentor_progress WHERE mentor_progress.user_id=mentors.user_id) AS 'count' FROM mentors LEFT OUTER JOIN mentor_topic_progress AS mentor_progress ON mentors.user_id=mentor_progress.user_id where (SELECT COUNT(mentor_topic_progress_id)FROM mentor_topic_progress AS mentor_progress WHERE mentor_progress.user_id=mentors.user_id)= 9 GROUP BY mentor_progress.user_id", { type: QueryTypes.SELECT });
            if (!mentorsResult) {
                throw notFound(speeches.DATA_NOT_FOUND)
            }
            if (mentorsResult instanceof Error) {
                throw mentorsResult
            }
            res.status(200).send(dispatcher(res, mentorsResult, "success"))
        } catch (err) {
            next(err)
        }
    }
    protected async courseInComplete(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { quiz_survey_id } = req.params
            const { page, size, role } = req.query;
            let condition = role ? { role: { [Op.eq]: role } } : null;
            const { limit, offset } = this.getPagination(page, size);
            const modelClass = await this.loadModel(this.model).catch(error => {
                next(error)
            });
            const paramStatus: any = req.query.status;
            let whereClauseStatusPart: any = {};
            let whereClauseStatusPartLiteral = "1=1";
            let addWhereClauseStatusPart = false
            if (paramStatus && (paramStatus in constents.common_status_flags.list)) {
                whereClauseStatusPart = { "status": paramStatus }
                whereClauseStatusPartLiteral = `status = "${paramStatus}"`
                addWhereClauseStatusPart = true;
            }
            const mentorsResult = await db.query("SELECT mentors.organization_code, mentors.district, mentors.full_name,(SELECT COUNT(mentor_topic_progress_id)FROM mentor_topic_progress AS mentor_progress WHERE mentor_progress.user_id=mentors.user_id) AS 'count' FROM mentors LEFT OUTER JOIN mentor_topic_progress AS mentor_progress ON mentors.user_id=mentor_progress.user_id where (SELECT COUNT(mentor_topic_progress_id)FROM mentor_topic_progress AS mentor_progress WHERE mentor_progress.user_id=mentors.user_id) != 9 GROUP BY mentor_progress.user_id", { type: QueryTypes.SELECT });
            console.log(mentorsResult);
            if (!mentorsResult) {
                throw notFound(speeches.DATA_NOT_FOUND)
            }
            if (mentorsResult instanceof Error) {
                throw mentorsResult
            }
            res.status(200).send(dispatcher(res, mentorsResult, "success"))
        } catch (err) {
            next(err)
        }
    }
    protected async notRegistered(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { quiz_survey_id } = req.params
            const { page, size, role } = req.query;
            let condition = role ? { role: { [Op.eq]: role } } : null;
            const { limit, offset } = this.getPagination(page, size);
            const modelClass = await this.loadModel(this.model).catch(error => {
                next(error)
            });
            const paramStatus: any = req.query.status;
            let whereClauseStatusPart: any = {};
            let whereClauseStatusPartLiteral = "1=1";
            let addWhereClauseStatusPart = false
            if (paramStatus && (paramStatus in constents.common_status_flags.list)) {
                whereClauseStatusPart = { "status": paramStatus }
                whereClauseStatusPartLiteral = `status = "${paramStatus}"`
                addWhereClauseStatusPart = true;
            }
            const mentorsResult = await db.query("SELECT * FROM organizations WHERE NOT EXISTS(SELECT mentors.organization_code  from mentors WHERE organizations.organization_code = mentors.organization_code) ", { type: QueryTypes.SELECT });
            if (!mentorsResult) {
                throw notFound(speeches.DATA_NOT_FOUND)
            }
            if (mentorsResult instanceof Error) {
                throw mentorsResult
            }
            res.status(200).send(dispatcher(res, mentorsResult, "success"))
        } catch (err) {
            next(err)
        }
    }

    protected async getAllMentorReports(req:Request,res:Response,next:NextFunction){
        try{
            
            let tr:any = req.query.tr;
            let tpre:any = req.query.tpre;
            let tc:any = req.query.tc;
            let tpost:any = req.query.tpost;
            let rs:any = req.query.rs;
            let dis:any = req.query.dis;

            if(!rs || 
                !(rs in constents.reports_all_ment_reports_rs_flags.list)){
                    rs="ALL"
            }
            let attrToBeInCluded:any = [
                "user_id"
            ]
            let totalNoOfTopics = 9
            if(tpre && tpre > 0 ){
                attrToBeInCluded.push(
                    [
                        // Note the wrapping parentheses in the call below!
                        //hard coded pre survey quiz id for mentor 
                        db.literal(`(
                            SELECT 
                                CASE WHEN EXISTS
                                    (
                                        SELECT qsr.user_id 
                                        FROM quiz_survey_responses as qsr 
                                        WHERE qsr.user_id = \`mentor\`.\`user_id\`
                                        AND qsr.quiz_survey_id= 1 
                                    )
                                THEN  
                                    (
                                        SELECT created_at 
                                        FROM quiz_survey_responses as qsr 
                                        WHERE qsr.user_id = \`mentor\`.\`user_id\`
                                        AND qsr.quiz_survey_id= 1 
                                    )
                                ELSE 
                                    "INCOMPLETE"
                            END as pre_survey_status
                        )`),
                        'pre_survey_status'
                    ],
                )
            }

            if(tpost && tpost >0){
                attrToBeInCluded.push(
                    [
                        // Note the wrapping parentheses in the call below!
                        //hard coded post survey quiz id for mentor 
                        db.literal(`(
                            SELECT CASE 
                                WHEN EXISTS
                                    (
                                        SELECT qsr.user_id 
                                        FROM quiz_survey_responses as qsr 
                                        WHERE qsr.user_id = \`mentor\`.\`user_id\`
                                        AND qsr.quiz_survey_id= 3 
                                    )
                                THEN  
                                    (
                                        SELECT created_at 
                                        FROM quiz_survey_responses as qsr 
                                        WHERE qsr.user_id = \`mentor\`.\`user_id\`
                                        AND qsr.quiz_survey_id= 3 
                                    )
                                ELSE 
                                    "INCOMPLETE"
                            END as post_survey_status
                        )`),
                        'post_survey_status'
                    ],
                )
            }

            if(tc && tc >0){
                const allMentorTopicsResult = await mentor_course_topic.findAll({
                    where:{
                        status:"ACTIVE"
                    },
                    raw:true,
                })
                
                if(!allMentorTopicsResult){
                    throw internal(speeches.INTERNAL)
                }
                if(allMentorTopicsResult instanceof Error){
                    throw allMentorTopicsResult
                }
                if(!allMentorTopicsResult.length){
                    throw internal(speeches.INTERNAL)
                }
                totalNoOfTopics = allMentorTopicsResult.length
                
                attrToBeInCluded.push(
                    [
                        // Note the wrapping parentheses in the call below!
                        //hard coded pre survey quiz id for mentor 
                        db.literal(`(
                            SELECT CASE 
                            WHEN  
                                (SELECT count(user_id)
                                FROM mentor_topic_progress as mtp 
                                WHERE mtp.user_id = \`mentor\`.\`user_id\`
                                ) >= ${totalNoOfTopics}
                            THEN  
                                "COMPLETED"
                            WHEN  
                                (SELECT count(user_id)
                                FROM mentor_topic_progress as mtp 
                                WHERE mtp.user_id = \`mentor\`.\`user_id\`
                                ) < ${totalNoOfTopics} 
                                AND 
                                (SELECT count(user_id)
                                FROM mentor_topic_progress as mtp 
                                WHERE mtp.user_id = \`mentor\`.\`user_id\`
                                ) > 0 
                            THEN  
                                "INPROGRESS"
                            ELSE 
                                "INCOMPLETE"
                            END as course_status
                        )`),
                        'course_status'
                    ],
                )
            }
            let disBasedWhereClause:any = {}
            if(dis){
                dis = dis.trim()
                disBasedWhereClause = {
                    district:dis  
                }
            }

            const reportservice =  new ReportService();
            let  rsBasedWhereClause:any = {}
            rsBasedWhereClause = await reportservice.fetchOrgCodeArrToIncInAllMentorReportBasedOnReportStatusParam(
                tr,tpre,tc,tpost,rs,totalNoOfTopics
            )
            
            //actual query being called here ...this result is to be returned...!!
            const organisationsResult:any = await organization.findAll({
                include:[
                    {
                        model:mentor,
                        attributes:{
                            include:attrToBeInCluded
                        },
                        include:[
                            {model:user}
                        ]
                    }
                ],
                where: {
                    [Op.and]: [
                        rsBasedWhereClause,
                        disBasedWhereClause
                    ]
                },
            })

            if(!organisationsResult){
                throw notFound(speeches.DATA_NOT_FOUND)
            }
            if(organisationsResult instanceof Error){
                throw organisationsResult
            }

            res.status(200).send(dispatcher(res,organisationsResult, 'success'));
        }catch(err){
            next(err)
        }
    }
}