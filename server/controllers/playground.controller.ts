import { FastifyRequest, FastifyReply, User } from 'fastify';




export async function getplaygroundView(request: FastifyRequest, reply: FastifyReply) {
	console.log("RHIUEAHWIUAH");
	
	return reply.viewAsync("playground.ejs", { isCollapsed: true });
}


let isCollapsed = false;

export default async function sidebarController(request: FastifyRequest, reply: FastifyReply) {
	
	isCollapsed = !isCollapsed;
	return reply.view('partials/sidebar.ejs', { isCollapsed });
}

// interface SidebarState {
	// 	collapsed: boolean;
	//   }
	
	// const userSidebarState: Record<string, SidebarState> = {};
// class MyClass {
// 	static count = 0;
  
// 	constructor() {
// 	  MyClass.count++;
// 	}
  
// 	static getCount() {
// 	  return MyClass.count;
// 	}
//   }

// export default function sidebarController(request: FastifyRequest, reply: FastifyReply) {
// 	// Endpoint to toggle sidebar
	
// 	// Get user ID from session or use a default
// 	//   const userId = (request.session?.user?.id as string) || 'default';
	  
// 	//   // Toggle state
// 	//   if (!userSidebarState[userId]) {
// 	// 	userSidebarState[userId] = { collapsed: false };
// 	//   }
	  
// 	//   userSidebarState[userId].collapsed = !userSidebarState[userId].collapsed;
// 	//   const isCollapsed = userSidebarState[userId].collapsed;
	  
// 	let isCollapsed: boolean = true;
// 	const hoi = new MyClass();
// 	if (MyClass.getCount() % 2 == 0)
// 	{
// 		isCollapsed = false;
// 	}

// 	  // Return the sidebar HTML based on state
// 	  return reply.view('partials/sidebar.ejs', { 
// 		isCollapsed,
// 		// Add any other data needed for the sidebar
// 	  });
//   }
  