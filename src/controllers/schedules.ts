import { Request, Response } from 'express';
import * as Schedules from '../models/schedules';
import * as TypeEnums from '../models/jobTypes';
import * as Users from '../models/users';
import * as Spares from '../models/spares';
import * as LoggedTime from '../models/loggedTime';
import makeIdList from '../helpers/makeIdList';
import timeDetailsArray from '../helpers/jobs/timeDetailsArray';

export async function getAllSchedules(req: Request, res: Response) {
    try {
        const propertyId = parseInt(req.params.propertyid);
        const schedules = await Schedules.getAllSchedules(propertyId);
        res.status(200).json(schedules);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getScheduleDetails(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.scheduleid);
        const scheduleDetails = await Schedules.getScheduleDetails(id);
        const usedSpares = await Spares.getUsedSpares('schedule', id);
        const timeDetails = await LoggedTime.getLoggedTimeDetails('schedule', id);
        if (timeDetails.length > 0) {
            const userIds = makeIdList(timeDetails, 'id');
            const users = await Users.getUsersByIds(userIds);
            const timeDetailsFull = timeDetailsArray(timeDetails, users);
            res.status(200).json({ scheduleDetails, usedSpares, timeDetails: timeDetailsFull });
        } else {
            res.status(200).json({ scheduleDetails, usedSpares });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }

}

export async function getAddScheduleEnums(req: Request, res: Response) {
    try {
        const types = await TypeEnums.getAllJobTypes();
        res.status(200).json({ types });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function addSchedule(req: Request, res: Response) {
    try {
        const response = await Schedules.addSchedule(req.body);
        if (response.affectedRows === 1) {
            res.status(201).json({ created: true });
        } else {
            res.status(500).json({ created: false });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ created: false });
    }
}