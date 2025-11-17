"""
Email Templates for hunter.lease
HTML templates for various notifications
"""

def get_email_template(template_type, data):
    """Get HTML email template"""
    
    templates = {
        "welcome": f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(to right, #dc2626, #b91c1c); color: white; padding: 30px; text-align: center; }}
                .content {{ padding: 30px; background: #f9fafb; }}
                .button {{ display: inline-block; background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; }}
                .footer {{ text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome to hunter.lease! 🎉</h1>
                </div>
                <div class="content">
                    <p>Hi {data.get('name', 'there')},</p>
                    <p>Welcome to hunter.lease - your trusted partner for real dump offers on new cars.</p>
                    <p><strong>What's next:</strong></p>
                    <ul>
                        <li>Complete your profile for personalized offers</li>
                        <li>Browse current dump deals</li>
                        <li>Get pre-qualified in 24 hours</li>
                    </ul>
                    <p style="text-align: center; margin: 30px 0;">
                        <a href="https://hunter.lease/dashboard" class="button">Go to Dashboard</a>
                    </p>
                </div>
                <div class="footer">
                    <p>hunter.lease | 2855 Michelle Dr, Irvine, CA 92606</p>
                    <p><a href="tel:+17477227494">+1 (747) CARGWIN</a> | info@cargwin.com</p>
                </div>
            </div>
        </body>
        </html>
        """,
        
        "application_received": f"""
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px;">
                    <h1>Application Received! ✓</h1>
                </div>
                <div style="padding: 30px; background: #f9fafb; margin-top: 20px;">
                    <p>Hi {data.get('name')},</p>
                    <p>We received your application for <strong>{data.get('car_title')}</strong>.</p>
                    <p><strong>What happens next:</strong></p>
                    <ol>
                        <li><strong>Hour 1-4:</strong> Soft credit check (no score impact)</li>
                        <li><strong>Hour 4-24:</strong> Dealer verification</li>
                        <li><strong>Hour 24:</strong> You receive final offer with YOUR exact rate</li>
                    </ol>
                    <p style="background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b;">
                        <strong>No hard credit pull</strong> until you approve the final offer. You're in control.
                    </p>
                    <p>Questions? Call <a href="tel:+17477227494">+1 (747) CARGWIN</a></p>
                </div>
            </div>
        </body>
        </html>
        """,
        
        "approved": f"""
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 40px; text-align: center; border-radius: 8px;">
                    <h1 style="font-size: 36px; margin: 0;">🎉 Congratulations!</h1>
                    <p style="font-size: 24px; margin: 10px 0;">You're Approved!</p>
                </div>
                <div style="padding: 30px; background: #f9fafb; margin-top: 20px;">
                    <p>Hi {data.get('name')},</p>
                    <p>Great news! Your application for <strong>{data.get('car_title')}</strong> has been approved.</p>
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3>Your Final Terms:</h3>
                        <table style="width: 100%;">
                            <tr>
                                <td>Monthly Payment:</td>
                                <td style="text-align: right; font-weight: bold;">${data.get('monthly', 0)}/month</td>
                            </tr>
                            <tr>
                                <td>Due at Signing:</td>
                                <td style="text-align: right; font-weight: bold;">${data.get('due_at_signing', 0)}</td>
                            </tr>
                            <tr>
                                <td>Term:</td>
                                <td style="text-align: right;">{data.get('term', 36)} months</td>
                            </tr>
                        </table>
                    </div>
                    <p><strong>Next Steps:</strong></p>
                    <ol>
                        <li>Review and e-sign your contract (link in separate email)</li>
                        <li>Upload proof of insurance</li>
                        <li>Schedule pickup (0-2 days)</li>
                    </ol>
                    <p style="text-align: center; margin: 30px 0;">
                        <a href="https://hunter.lease/dashboard" style="display: inline-block; background: #dc2626; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                            View Dashboard
                        </a>
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
    }
    
    return templates.get(template_type, templates['welcome'])
