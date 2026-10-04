import {Shell} from "../preferences";
import {adminAccess} from "@/lib/server";
import Admin from "./panel";
export const dynamic="force-dynamic";
export default async function AdminPage(){const access=await adminAccess();return <Shell admin><Admin access={access.allowed?"allowed":!access.configured?"unconfigured":"signin"}/></Shell>}
