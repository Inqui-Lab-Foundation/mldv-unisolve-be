import { Request, Response } from "express";
import config from "config";

import logger from '../utils/logger'
import adminServices from "../services/admin.services";
import sessionServices from "../services/session.services";
import { signJwt } from "../utils/jwt";
import operationalServices from "@src/services/operational.services";
import { log } from "@src/models/log";

// controller handlers class
class authController {
    //new student handler response with the created student, conflict if the student exist, and error message if anything went wrong
    async registerHandler(req: Request, res: Response) {
        const { email } = req.body;

        //checking for duplicate
        const match = await adminServices.find({ where: { email } });
        if (match) return res.sendStatus(409);

        //create student with the help studentService
        const newE = await adminServices.build(req.body);
        if (!newE) return res.sendStatus(500);
        operationalServices.build(log, {
            api_name: req.originalUrl,
            request_method: req.method,
            request: `${JSON.stringify(req.body)}`,
            response: `${JSON.stringify(newE)}`,
            status: 'success'
        });
        return res.status(201).json({ info: newE, message: "admin successfully Registered" });
    };
    // student login handler find the students, create the session and issues token   
    async loginHandler(req: Request, res: Response) {
        const { email, password } = req.body;
        let match;
        // finding the student with the email
        if (email) { match = await adminServices.find({ where: { email } }); }
        //if student not found
        if (!match) return res.sendStatus(401);
        const foundAccount = match;
        const foundSession = await sessionServices.destroySession(foundAccount.id); // deleting existing if any with student_id
        // validating the student password
        if (password === foundAccount.password) {
            const input = { userId: foundAccount.id, studentAgent: req.get("student-agent") || "", valid: true };
            const session = await sessionServices.createSession(input); // creating new session 
            const Token = signJwt(
                { foundAccount, session: session.id },
                { expiresIn: config.get<string>('accessTokenTtl') }
            ); // issuing access token
            const { id, email, role } = foundAccount;
            logger.info(`admin logged in ${JSON.stringify(foundAccount)}`);
            operationalServices.build(log, {
                api_name: req.originalUrl,
                request_method: req.method,
                request: `${JSON.stringify(req.body)}`,
                response: `${JSON.stringify({ id, role, email, Token })}`,
                status: 'success'
            });
            return res.status(200).json({ id, role, email, Token });
        }
        logger.error(`Invalid email or password, fail to validate the password please check and try again`);
        return res.sendStatus(403);
    };
    // student change password handler
    async changePasswordHandler(req: Request, res: Response) {
        try {
            const record = await adminServices.changePassword(req.body);
            operationalServices.build(log, {
                api_name: req.originalUrl,
                request_method: req.method,
                request: `${JSON.stringify(req.body)}`,
                response: `${JSON.stringify(record)}`,
                status: 'success'
            });
            return res.status(202).json({ message: "Password updated successfully" })
        } catch (error: any) {
            operationalServices.build(log, {
                api_name: req.originalUrl,
                request_method: req.method,
                request: `${JSON.stringify(req.body)}`,
                response: `${JSON.stringify(error.message)}`,
                status: 'failed'
            });
            return res.status(503).json({ message: error.message })
        }
    };
    // student logout handler marking session validate false
    async logoutHandler(req: Request, res: Response) {
        //@ts-ignore
        const userId = res.locals.id;
        try {
            const foundSession = await sessionServices.findSession({ where: { userId } });
            if (!foundSession) res.status(409).json({ message: 'session not found' })
            foundSession.setDataValue('valid', false);
            foundSession.save();
            operationalServices.build(log, {
                api_name: req.originalUrl,
                request_method: req.method,
                request: `${JSON.stringify(req.body)}`,
                response: `${JSON.stringify({ message: "cleared student session successfully" })}`,
                status: 'success'
            });
            return res.status(200).json({ message: "cleared student session successfully" });
        } catch (error: any) {
            res.sendStatus(400);
        }
    };
}

export default new authController();