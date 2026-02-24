
import { getActivities } from "@/actions/activity";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";

import { SearchInput } from "@/components/search-input";

export default async function PublicActivitiesPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await searchParams;
    const search = typeof params.q === 'string' ? params.q : undefined;
    const activities = await getActivities(undefined, search);

    return (
        <div className="container mx-auto py-20 px-4 min-h-screen">
            <div className="max-w-4xl mx-auto mb-16 text-center">
                <h1 className="text-4xl font-bold mb-4">Ongoing Training & Activities</h1>
                <p className="text-slate-600 text-lg mb-8">
                    Browse through our latest professional development sessions and vocational training programs.
                </p>
                <div className="flex justify-center">
                    <SearchInput placeholder="Search upcoming activities..." className="w-full max-w-md shadow-lg" />
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {activities.map((activity: any) => (
                    <Card key={activity._id} className="flex flex-col hover:shadow-lg transition-shadow border-slate-200">
                        <CardHeader>
                            <div className="flex justify-between items-start mb-2">
                                <Badge variant={activity.status === 'Open' ? 'secondary' : 'outline'} className={
                                    activity.status === 'Open' ? 'bg-green-100 text-green-700 hover:bg-green-100 border-none' : ''
                                }>
                                    {activity.status}
                                </Badge>
                            </div>
                            <CardTitle className="line-clamp-2 leading-snug hover:text-blue-600 transition-colors">
                                <Link href={`/activities/${activity._id}`}>
                                    {activity.title}
                                </Link>
                            </CardTitle>
                            <CardDescription className="line-clamp-3 mt-2">{activity.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-3">
                            <div className="flex items-center text-sm text-slate-500">
                                <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                                {new Date(activity.date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center text-sm text-slate-500">
                                <Users className="w-4 h-4 mr-2 text-slate-400" />
                                {activity.registrationsCount} / {activity.quota} registered
                            </div>
                            <div className="flex items-center text-sm text-slate-500">
                                <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                                Online / Bangkok Region
                            </div>
                        </CardContent>
                        <CardFooter className="pt-6 border-t gap-3">
                            <Button variant="outline" className="flex-1" asChild>
                                <Link href={`/activities/${activity._id}`}>
                                    ดูรายละเอียด
                                </Link>
                            </Button>
                            <Button className="flex-1 bg-blue-600 hover:bg-blue-700" asChild>
                                <Link href={`/login?callbackUrl=/activities/${activity._id}`}>
                                    ลงทะเบียน <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
                {activities.length === 0 && (
                    <div className="col-span-full py-20 text-center border-2 border-dashed rounded-3xl">
                        <p className="text-slate-500">No active activities found at the moment.</p>
                    </div>
                )}
            </div>

            <div className="mt-20 text-center bg-slate-50 rounded-3xl p-12 border border-slate-200">
                <h3 className="text-2xl font-bold mb-4">Are you a Supervisor?</h3>
                <p className="text-slate-600 mb-8 max-w-xl mx-auto">
                    Supervisors can manage these activities, review submissions, and issue certificates.
                </p>
                <Button variant="outline" size="lg" asChild>
                    <Link href="/login">Supervision Login</Link>
                </Button>
            </div>
        </div>
    );
}
