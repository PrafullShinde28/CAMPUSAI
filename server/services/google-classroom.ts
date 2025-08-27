import { google } from "googleapis";

export interface ClassroomAssignment {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  courseName: string;
}

export class GoogleClassroomService {
  private classroom: any;

  constructor(accessToken: string) {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    this.classroom = google.classroom({ version: "v1", auth });
  }

  async getAssignments(): Promise<ClassroomAssignment[]> {
    try {
      const courses = await this.classroom.courses.list({
        studentId: "me",
      });

      const assignments: ClassroomAssignment[] = [];

      for (const course of courses.data.courses || []) {
        const courseWork = await this.classroom.courses.courseWork.list({
          courseId: course.id,
        });

        for (const work of courseWork.data.courseWork || []) {
          if (work.dueDate) {
            assignments.push({
              id: work.id,
              title: work.title,
              description: work.description || "",
              dueDate: new Date(
                work.dueDate.year,
                work.dueDate.month - 1,
                work.dueDate.day
              ),
              courseName: course.name,
            });
          }
        }
      }

      return assignments.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
    } catch (error) {
      console.error("Error fetching assignments:", error);
      return [];
    }
  }

  async getCourses() {
    try {
      const response = await this.classroom.courses.list({
        studentId: "me",
      });
      return response.data.courses || [];
    } catch (error) {
      console.error("Error fetching courses:", error);
      return [];
    }
  }
}
