
import { verifyCertificate } from "@/actions/certificate";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CheckCircle, XCircle, Award, Calendar, User, MapPin } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface VerifyPageProps {
    params: {
        code: string;
    };
}

export default async function VerifyPage({ params }: VerifyPageProps) {
    const certificate = await verifyCertificate(params.code);

    if (!certificate) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <Card className="w-full max-w-md shadow-lg border-t-4 border-t-red-500">
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-red-100 p-3 rounded-full w-fit mb-4">
                            <XCircle className="w-8 h-8 text-red-600" />
                        </div>
                        <CardTitle className="text-xl text-red-700">Invalid Certificate</CardTitle>
                        <CardDescription>
                            The certificate code <span className="font-mono font-bold text-gray-800">{params.code}</span> could not be verified.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center text-sm text-gray-500">
                        Please check the code and try again. It might have been typed incorrectly.
                    </CardContent>
                    <CardFooter className="justify-center border-t pt-6">
                        <Link href="/">
                            <Button variant="outline">Go to Homepage</Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    const activity = certificate.activityId;
    const user = certificate.userId;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-lg shadow-lg border-t-4 border-t-green-600">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-green-100 p-3 rounded-full w-fit mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl text-green-800 mb-1">Valid Certificate</CardTitle>
                    <CardDescription className="text-gray-600">
                        This certificate is authentic and issued by OVEC Platform.
                    </CardDescription>
                    <Badge variant="outline" className="mx-auto mt-2 bg-green-50 text-green-700 border-green-200 font-mono">
                        {certificate.certificateCode}
                    </Badge>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="space-y-1 text-center border-b pb-4">
                        <p className="text-sm text-gray-500 uppercase tracking-wide">Issued To</p>
                        <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
                        <p className="text-sm text-gray-500">{user.email}</p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <Award className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Training Program</p>
                                <p className="text-base text-gray-700">{activity.title}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Completion Date</p>
                                <p className="text-base text-gray-700">
                                    {format(new Date(certificate.issuedAt), "PPP")}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Location</p>
                                <p className="text-base text-gray-700">{activity.location}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="justify-center border-t pt-6 bg-gray-50/50 rounded-b-lg">
                    <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-4">
                            Verified System Timestamp: {new Date().toISOString()}
                        </p>
                        <Link href="/">
                            <Button variant="outline">Back to OVEC Platform</Button>
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
