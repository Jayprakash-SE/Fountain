﻿using System;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;

[assembly: PreApplicationStartMethod(typeof(WikiFountain.Server.Global), "BeforeStart")]

namespace WikiFountain.Server
{
    public class Global : HttpApplication
    {
        public static void BeforeStart()
        {
            AppDomain.CurrentDomain.UnhandledException += (s, e) => Log(e.ExceptionObject.ToString());
            Microsoft.Web.Infrastructure.DynamicModuleHelper.DynamicModuleUtility.RegisterModule(typeof(DbSessionModule));
        }

        public static void Log(string text)
        {
            System.IO.File.AppendAllText(HttpRuntime.AppDomainAppPath + "/log", text + Environment.NewLine);
        }

        void Application_Start(object sender, EventArgs e)
        {
            AreaRegistration.RegisterAllAreas();
            WebApiConfig.Register(GlobalConfiguration.Configuration);
            MvcConfig.Register();
        }
    }
}
