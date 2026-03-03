import { getActivities } from "@/actions/activity";
import { auth } from "@/auth"; // Use auth to protect route
import { redirect } from "next/navigation";
import { ManageActivitiesClient } from "./manage-activities-client";

export default async function ManageActivitiesPage() {
    const session = await auth();
    // Protect route: Only supervisor and super_admin can access
    if (!session || session.user.role === "teacher") {
        redirect("/dashboard/activities"); // Redirect teachers to view page
    }

    const activities = await getActivities();

    return (
        <ManageActivitiesClient activities={activities} />
    );
}
